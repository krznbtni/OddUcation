pragma solidity ^0.4.20;

import './Ownable.sol';

contract Destructible is Ownable {

  function Destructible() public payable { }

  function destroy() onlyOwner public {
    selfdestruct(owner);
  }

  function destroyAndSend(address _recipient) onlyOwner public {
    selfdestruct(_recipient);
  }
}
