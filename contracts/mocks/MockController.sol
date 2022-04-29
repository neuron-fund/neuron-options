/**
 * SPDX-License-Identifier: UNLICENSED
 */
pragma solidity 0.8.9;

// import "../packages/oz/upgradeability/VersionedInitializable.sol";
import "../interfaces/ONtokenInterface.sol";
import "../interfaces/CalleeInterface.sol";
import "../interfaces/ERC20Interface.sol";

/**
 * @notice Upgradeable Controller that can mock minting and burning calls from controller.
 */
contract MockController {
    /// @notice addressbook address
    address public addressBook;
    address public owner;

    /**
     * @dev this function is invoked by the proxy contract when this contract is added to the
     * AddressBook.
     * @param _addressBook the address of the AddressBook
     **/
    function initialize(address _addressBook, address _owner) external {
        addressBook = _addressBook;
        owner = _owner;
    }

    /**
     * @dev this function is used to test if controller can mint onTokens
     */
    function testMintONtoken(
        address _onToken,
        address _account,
        uint256 _amount,
        uint256[] memory collateralsAmountsForMint,
        uint256[] memory collateralsValuesForMint
    ) external {
        ONtokenInterface(_onToken).mintONtoken(_account, _amount, collateralsAmountsForMint, collateralsValuesForMint);
    }

    /**
     * @dev this function is used to test if controller can burn onTokens
     */
    function testBurnONtoken(
        address _onToken,
        address _account,
        uint256 _amount
    ) external {
        ONtokenInterface(_onToken).burnONtoken(_account, _amount);
    }

    /**
     * @dev this function is used to test if controller can be the only msg.sender to the 0xcallee
     */
    function test0xCallee(address _callee, bytes memory _data) external {
        CalleeInterface(_callee).callFunction(payable(msg.sender), _data);
    }
}
