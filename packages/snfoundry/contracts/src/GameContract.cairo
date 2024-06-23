use starknet::ContractAddress;

#[starknet::interface]
pub trait IGameContract<TContractState> {
    fn start_game(ref self: TContractState);
    fn continue_game(ref self: TContractState, user_id: ContractAddress, game_details: ByteArray);
    fn end_game(ref self: TContractState, user_id: ContractAddress);
    fn withdraw(ref self: TContractState);
    fn premium(self: @TContractState) -> bool;
}

#[starknet::contract]
mod GameContract {
    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::token::erc20::interface::{IERC20CamelDispatcher, IERC20CamelDispatcherTrait};
    use starknet::{get_caller_address, get_contract_address};
    use super::{ContractAddress, IGameContract};

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    const ETH_CONTRACT_ADDRESS: felt252 =
        0x49D36570D4E46F48E99674BD3FCC84644DDD6B96F7C741B1562B82F9E004DC7;

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        GameStarted: GameStarted,
        GameContinued: GameContinued,
        GameEnded: GameEnded,
    }

    #[derive(Drop, starknet::Event)]
    struct GameStarted {
        #[key]
        player: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct GameContinued {
        #[key]
        player: ContractAddress,
        game_details: ByteArray,
    }

    #[derive(Drop, starknet::Event)]
    struct GameEnded {
        #[key]
        player: ContractAddress,
        token_id: u256,
    }

    #[storage]
    struct Storage {
        eth_token: IERC20CamelDispatcher,
        premium: bool,
        total_counter: u256,
        user_game_counter: LegacyMap<ContractAddress, u256>,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        let eth_contract_address = ETH_CONTRACT_ADDRESS.try_into().unwrap();
        self.eth_token.write(IERC20CamelDispatcher { contract_address: eth_contract_address });
        self.ownable.initializer(owner);
    }

    #[abi(embed_v0)]
    impl GameContractImpl of IGameContract<ContractState> {
        fn start_game(ref self: ContractState) {
            let player = get_caller_address();
            self.total_counter.write(self.total_counter.read() + 1);
            
            self.emit(GameStarted { player });
        }

        fn continue_game(ref self: ContractState, user_id: ContractAddress, game_details: ByteArray) {
            let player = get_caller_address();
            let user_counter = self.user_game_counter.read(player);
            self.user_game_counter.write(player, user_counter + 1);

            if self.premium.read() {
                // Interact with user's wallet if premium
                // Call `approve` on ETH contract before transferring amount_eth
                let amount_eth = 100; // example amount
                self.eth_token.read().transferFrom(player, get_contract_address(), amount_eth);
            }

            self.emit(GameContinued { player, game_details });
        }

        fn end_game(ref self: ContractState, user_id: ContractAddress) {
            let player = get_caller_address();
            let token_id = self.total_counter.read(); // Example: using total_counter as token_id

            self.emit(GameEnded { player, token_id });
        }

        fn withdraw(ref self: ContractState) {
            self.ownable.assert_only_owner();
            let balance = self.eth_token.read().balanceOf(get_contract_address());
            self.eth_token.read().transfer(self.ownable.owner(), balance);
        }

        fn premium(self: @ContractState) -> bool {
            self.premium.read()
        }
    }
}
