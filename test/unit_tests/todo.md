_checkIsValidVault is not used in MarginCalculator


  describe('Get excess margin tests', () => {
      xit('Should revert when collateral assets and amounts have differenct length', async () => {
        // AssertionError: Expected an exception but none was received  

        const vault: VaultStruct = createVault(eth100Put.address, undefined, [usdc.address], undefined, undefined, [])
        await calculator.getExcessCollateral(vault)

        await expectRevert(
          calculator.getExcessCollateral(vault),
          'MarginCalculator: Collateral asset and amount mismatch',
        )
      })

      xit('Should revert when collateral assets is different from short.collateral', async () => {
        // AssertionError: Expected an exception but none was received
        const vault: VaultStruct = createVault(
          eth100Put.address,
          undefined,
          [weth.address],
          scaleNum(1),
          undefined,
          [createTokenAmount(100, wethDecimals)],
        )

        /*
        const expiryTimestamp = await eth100Put.expiryTimestamp()
        await oracle.setExpiryPriceFinalizedAllPeiodOver(usdc.address, expiryTimestamp, createTokenAmount(1), true)        
        await oracle.setExpiryPriceFinalizedAllPeiodOver(weth.address, expiryTimestamp, createTokenAmount(1), true)
          */
        await expectRevert(
          calculator.getExcessCollateral(vault),
          'MarginCalculator: collateral asset not marginable for short asset',
        )
      })

      xit("Should return collateral amount if there's no short.", async () => {
        // Error: Returned error: Error: Transaction reverted: function call to a non-contract account
        const collateralAmount = createTokenAmount(100, usdcDecimals)
        const vault = createVault(undefined, undefined, [usdc.address], undefined, undefined, [collateralAmount])

        const [netValue, isExcess] = await calculator.getExcessCollateral(vault)
        assert.equal(netValue.toString(), collateralAmount.toString())
        assert.isTrue(isExcess)
      })

      xit('Should revert if long token has different underlying as short.', async () => {
        // Returned error: Error: VM Exception while processing transaction: reverted with panic code 0x12 (Division or modulo division by zero)
        const otokenWrongUnderlying = await MockOtoken.new()
        await otokenWrongUnderlying.init(
          addressBook.address,
          dai.address,
          usdc.address,
          [usdc.address],
          '0',
          expiry,
          true,
        )
        const vault = createVault(
          eth250Put.address,
          otokenWrongUnderlying.address,
          [],
          scaleNum(1),
          scaleNum(1),
          [],
        )


        await expectRevert(
          calculator.getExcessCollateral(vault),
          'MarginCalculator: long asset not marginable for short asset',
        )
      })

      xit('Should revert if long token has different strike as short.', async () => {
        // Returned error: Error: VM Exception while processing transaction: reverted with panic code 0x12 (Division or modulo division by zero)
        const otokenWrongStrike = await MockOtoken.new()
        await otokenWrongStrike.init(addressBook.address, weth.address, dai.address, [usdc.address], '0', expiry, true)
        const vault = createVault(
          eth250Put.address,
          otokenWrongStrike.address,
          [],
          scaleNum(1),
          scaleNum(1),
          [],
        )

        await expectRevert(
          calculator.getExcessCollateral(vault),
          'MarginCalculator: long asset not marginable for short asset',
        )
      })

      xit('Should revert if long token has different collateral as short.', async () => {
        // Returned error: Error: VM Exception while processing transaction: reverted with panic code 0x12 (Division or modulo division by zero)
        const otokenWrongCollateral = await MockOtoken.new()
        await otokenWrongCollateral.init(
          addressBook.address,
          weth.address,
          usdc.address,
          [dai.address],
          '0',
          expiry,
          true,
        )

        const vault = createVault(
          eth250Put.address,
          otokenWrongCollateral.address,
          [],
          scaleNum(1),
          scaleNum(1),
          [],
        )


        await expectRevert(
          calculator.getExcessCollateral(vault),
          'MarginCalculator: long asset not marginable for short asset',
        )
      })

      xit('Should revert if long token has different expiry as short.', async () => {
        // Returned error: Error: VM Exception while processing transaction: reverted with panic code 0x12 (Division or modulo division by zero)
        const otokenWrongExpiry = await MockOtoken.new()
        await otokenWrongExpiry.init(
          addressBook.address,
          weth.address,
          usdc.address,
          [usdc.address],
          '0',
          expiry + 1,
          true,
        )

        const vault = createVault(
          eth250Put.address,
          otokenWrongExpiry.address,
          [],
          scaleNum(1),
          scaleNum(1),
          [],
        )


        await expectRevert(
          calculator.getExcessCollateral(vault),
          'MarginCalculator: long asset not marginable for short asset',
        )
      })

      xit('Should revert when collateral is different from collateral of short', async () => {
        // Returned error: Error: VM Exception while processing transaction: reverted with panic code 0x12 (Division or modulo division by zero)
        const vault = createVault(eth200Put.address, undefined, [weth.address], scaleNum(1), undefined, [100])
        await expectRevert(
          calculator.getExcessCollateral(vault),
          'MarginCalculator: collateral asset not marginable for short asset',
        )
      })

      xit('Should revert when vault only contain long and collateral, and collateral is different from collateral of long', async () => {
        //_vault.shortOtoken 0x0000000000000000000000000000000000000000
        const vault = createVault(undefined, eth200Put.address, [weth.address], undefined, scaleNum(1), [100])


        await expectRevert(
          calculator.getExcessCollateral(vault),
          'MarginCalculator: collateral asset not marginable for short asset',
        )
      })
  })