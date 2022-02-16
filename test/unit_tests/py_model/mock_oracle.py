from dataclasses import dataclass
from email.policy import default
from soltypes import uint256list, address, addrlist, uint256, uint80
from collections import defaultdict

@dataclass
class Price:
    price: uint256
    timestamp: uint256  # timestamp at which the price is pushed to this oracle


stablePrice = {} # address => uint256
pricerLockingPeriod = {} # address => uint256
pricerDisputePeriod = {} # address => uint256
assetPricer = {} # address => address

# asset => expiry => bool
_isDisputePeriodOver = defaultdict(dict) # address => mapping(uint256 => bool)
_isLockingPeriodOver = defaultdict(dict) # address => mapping(uint256 => bool)

# chainlink historic round data, asset => round => price/timestamp
_roundPrice = defaultdict(dict) # address => mapping(uint80 => uint256)
_roundTimestamp = defaultdict(dict) # address => mapping(uint80 => uint256)




class MockOracle:
    def __init__(self):
        self.realTimePrice = {} # address => uint256
        self.storedPrice = defaultdict(dict) # address => mapping(uint256 => uint256)
        self.isFinalized = defaultdict(dict) # address => mapping(uint256 => boo

    def setRealTimePrice(self, _asset: address,  _price: uint256):
        self.realTimePrice[_asset] = _price
   

    # get chainlink historic round data
    def getChainlinkRoundData(self, _asset: address, _roundId: uint80 ) -> tuple:
        price = uint256(_roundPrice[_asset][_roundId])
        timestamp = uint256(_roundTimestamp[_asset][_roundId])
        return (price, timestamp)

    def getPrice(self, _asset: address) -> uint256:
        price = uint256(stablePrice.get(_asset, 0))
        if (price == 0):
            price = uint256(realTimePrice.get(_asset, 0))
        return price

    # set chainlink historic data for specific round id
    def setChainlinkRoundData(self, _asset: address, _roundId: uint80, _price: uint256, _timestamp: uint256):
        _roundPrice[_asset][_roundId] = _price;
        _roundTimestamp[_asset][_roundId] = _timestamp;

    # set bunch of things at expiry in 1 function
    def setExpiryPriceFinalizedAllPeiodOver(self,
            _asset: address, 
            _expiryTimestamp: uint256,
            _price: uint256,
            _isFinalized: bool):
        
        self.storedPrice[_asset][_expiryTimestamp] = _price
        self.isFinalized[_asset][_expiryTimestamp] = _isFinalized
        _isDisputePeriodOver[_asset][_expiryTimestamp] = _isFinalized
        _isLockingPeriodOver[_asset][_expiryTimestamp] = _isFinalized
    

    # let the pricer set expiry price to oracle.
    def setExpiryPrice(self,
                       _asset: address,
                       _expiryTimestamp: uint256,
                       _price: uint256):

        self.storedPrice[_asset][_expiryTimestamp] = _price;
    }

    function setIsFinalized(
        address _asset,
        uint256 _expiryTimestamp,
        bool _isFinalized
    ) external {
        isFinalized[_asset][_expiryTimestamp] = _isFinalized;
    }

    function getExpiryPrice(address _asset, uint256 _expiryTimestamp) external view returns (uint256, bool) {
        uint256 price = stablePrice[_asset];
        bool _isFinalized = true;

        if (price == 0) {
            price = storedPrice[_asset][_expiryTimestamp];
            _isFinalized = isFinalized[_asset][_expiryTimestamp];
        }

        return (price, _isFinalized);
    }

    function getPricer(address _asset) external view returns (address) {
        return assetPricer[_asset];
    }

    function getPricerLockingPeriod(address _pricer) external view returns (uint256) {
        return pricerLockingPeriod[_pricer];
    }

    function getPricerDisputePeriod(address _pricer) external view returns (uint256) {
        return pricerDisputePeriod[_pricer];
    }

    function isLockingPeriodOver(address _asset, uint256 _expiryTimestamp) public view returns (bool) {
        return _isLockingPeriodOver[_asset][_expiryTimestamp];
    }

    function setIsLockingPeriodOver(
        address _asset,
        uint256 _expiryTimestamp,
        bool _result
    ) external {
        _isLockingPeriodOver[_asset][_expiryTimestamp] = _result;
    }

    function isDisputePeriodOver(address _asset, uint256 _expiryTimestamp) external view returns (bool) {
        return _isDisputePeriodOver[_asset][_expiryTimestamp];
    }

    function setIsDisputePeriodOver(
        address _asset,
        uint256 _expiryTimestamp,
        bool _result
    ) external {
        _isDisputePeriodOver[_asset][_expiryTimestamp] = _result;
    }

    function setAssetPricer(address _asset, address _pricer) external {
        assetPricer[_asset] = _pricer;
    }

    function setLockingPeriod(address _pricer, uint256 _lockingPeriod) external {
        pricerLockingPeriod[_pricer] = _lockingPeriod;
    }

    function setDisputePeriod(address _pricer, uint256 _disputePeriod) external {
        pricerDisputePeriod[_pricer] = _disputePeriod;
    }

    function setStablePrice(address _asset, uint256 _price) external {
        stablePrice[_asset] = _price;
    }
}
