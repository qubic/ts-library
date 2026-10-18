export class QubicPackageType{
    public static EXCHANGE_PUBLIC_PEER = 0;
    public static BROADCAST_MESSAGE = 1;
    public static BROADCAST_COMPUTORS = 2;
    public static BROADCAST_TICK = 3;
    public static BROADCAST_FUTURE_TICK_DATA = 8;
    public static REQUEST_COMPUTORS = 11;
    public static REQUEST_QUORUM_TICK = 14;
    public static REQUEST_TICK_DATA = 16;
    public static BROADCAST_TRANSACTION = 24;

    public static REQUEST_CURRENT_TICK_INFO = 27;
    public static RESPOND_CURRENT_TICK_INFO = 28;
    public static REQUEST_TICK_TRANSACTIONS = 29;
    public static REQUEST_ENTITY = 31;
    public static RESPOND_ENTITY = 32;
    public static REQUEST_CONTRACT_IPO = 33;
    public static RESPOND_CONTRACT_IPO = 34;

    public static REQUEST_ISSUED_ASSETS = 36;
    public static RESPOND_ISSUED_ASSETS = 37;

    public static REQUEST_OWNED_ASSETS = 38;
    public static RESPOND_OWNED_ASSETS = 39;

    public static REQUEST_POSSESSED_ASSETS = 39;
    public static RESPOND_POSSESSED_ASSETS = 40;

    public static RequestContractFunction = 42;
    public static RespondContractFunction = 43;

    public static PROCESS_SPECIAL_COMMAND = 255;
}