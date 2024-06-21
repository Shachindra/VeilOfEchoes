#[starknet::contract]
mod StarkGame {
    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::token::erc721::ERC721Component;
    use openzeppelin::token::erc721::ERC721HooksEmptyImpl;
    use starknet::{ContractAddress,get_caller_address};

    component!(path: ERC721Component, storage: erc721, event: ERC721Event);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    #[abi(embed_v0)]
    impl ERC721MixinImpl = ERC721Component::ERC721MixinImpl<ContractState>;
    #[abi(embed_v0)]
    impl OwnableMixinImpl = OwnableComponent::OwnableMixinImpl<ContractState>;

    impl ERC721InternalImpl = ERC721Component::InternalImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;
    
    #[storage]
    struct Storage {
        gameId: u128,
        totalcheckpoints: u128,
        proofs: LegacyMap::<u128, ByteArray>,
        isPaused: bool,
        userGameId: LegacyMap::<ContractAddress,u64 >,
        userCheckpoint: LegacyMap::<ContractAddress,u64>,
        userGameStatus: LegacyMap::<ContractAddress,GameState>
        #[substorage(v0)]
        erc721: ERC721Component::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
    }

    #[derive(Copy, Drop, Serde)]
    enum GameState {
        IN_PROGRESS,
        GAMEOVER,
        QUESTS
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC721Event: ERC721Component::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
    }

    #[constructor]
    fn constructor(ref self: ContractState, total_checkpoints: u128,owner: ContractAddress) {
         self.erc721.initializer("StarkGame", "MTK", "");
        self.ownable.initializer(owner);
        self.gameId.write(1);
        self.isPaused.write(false);
    }

    #[generate_trait]
    #[abi(embed_v0)]
    impl StarkGame of super::IStarkGame<ContractState> {
        fn get_game_id(self: @ContractState) -> u128 {
            return self.gameId.read();
        }

         fn get_game_paused(self: @ContractState) -> bool {
            return self.isPaused.read();
        }

        fn update_game(ref self: ContractState) {
            self.ownable.assert_only_owner();
            let counter = self.gameId.read() + 1;
            self.gameId.write(counter);
        }

        fn add_proofs(ref self: ContractState, id: u128 , proof_data: ByteArray) {
            self.ownable.assert_only_owner();
            self.proofs.write(id, proof_data);
        }

        fn set_pause(ref self: ContractState, value: bool) {
            self.ownable.assert_only_owner();
            self.isPaused.write(value);
        }

        #[external(v0)]
        fn start_game(
            ref self: ContractState,
            recipient: ContractAddress,
            token_id: u256,
            data: Span<felt252>,
        ) {
            assert!(self.isPaused.read() == false, "Contract is isPaused");
            self.erc721.safe_mint(recipient, token_id, data);
        }
    }
}