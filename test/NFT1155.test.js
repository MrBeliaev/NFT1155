const NFT1155 = artifacts.require('NFT1155')

contract('NFT1155', ([owner, user1, user2, user3, user4, user5, user6, user7, user8, moneyReceiver]) => {
    it('Deploy', async () => {
        nft = await NFT1155.new()
        console.log("NFT1155 deployed to:", nft.address)
    })
    it('setURI + event URI', async () => {
        uri = await nft.uri(1)
        assert.equal(uri, "")
        uri1 = "URI 1"
        uri2 = "URI 2"
        uri3 = "URI 3"
        URI = await nft.setURI(1, uri1)
        await nft.setURI(2, uri2)
        await nft.setURI(3, uri3)
        assert.equal(await nft.uri(1), uri1)
        assert.equal(await nft.uri(2), uri2)
        assert.equal(await nft.uri(3), uri3)
        const log = URI.logs[0]
        assert.equal(log.event, 'URI')
        const event = log.args
        assert.equal(event.value, uri1)
        assert.equal(event.id, 1)
    })
    it('setCounts + event SetCount', async () => {
        SetCounts = await nft.setCounts(
            [user1, user2, user3, user4, user5, user6, user7, user8],
            [1,1,1,2,2,2,3,3],
            [1,2,3,1,2,3,1,2])
        const log = SetCounts.logs[0]
        assert.equal(log.event, 'SetCounts')
        const event = log.args
        assert.equal(event.addressesCount, 8)
    })
    it('setPrice + event SetPrice', async () => {
        price1 = web3.utils.toWei("1", "ether")
        price2 = web3.utils.toWei("2", "ether")
        price3 = 0
        await nft.setPrice(1, price1)
        await nft.setPrice(2, price2)
        SetPrice = await nft.setPrice(3, price3)
        const log = SetPrice.logs[0]
        assert.equal(log.event, 'SetPrice')
        const event = log.args
        assert.equal(event.tokenId, 3)
        assert.equal(event.price.toString(), price3.toString())
    })
    it('mint error "Count Greater than 0"', async () => {
        try {
            await nft.mint(2, 0, "0x0", {from: user4, value: price2})
        } catch (e) {
            assert.equal(e.message.includes("Count Greater than 0"), true)
        }
    })
    it('mint error "Limit reached"', async () => {
        try {
            await nft.mint(2, 5, "0x0", {from: user4, value: price2})
        } catch (e) {
            assert.equal(e.message.includes("Limit reached"), true)
        }
    })
    it('mint user2 + event Mint', async () => {
        balanceUser2Before = web3.utils.fromWei(await web3.eth.getBalance(user2), "ether")
        balanceOwnerBefore = web3.utils.fromWei(await web3.eth.getBalance(owner), "ether")
        Mint = await nft.mint(1, 2, "0x0", {from: user2, value: price1*2})
        balanceUser2After = web3.utils.fromWei(await web3.eth.getBalance(user2), "ether")
        balanceOwnerAfter = web3.utils.fromWei(await web3.eth.getBalance(owner), "ether")
        const log = Mint.logs[1]
        assert.equal(log.event, 'Mint')
        const event = log.args
        assert.equal(event.userAddress, user2)
        assert.equal(event.tokenId, 1)
        assert.equal(event.count, 2)
        assert.equal(event.amount.toString(), price1*2)
        assert.equal(Math.round(balanceUser2Before-balanceUser2After), Math.round(balanceOwnerAfter-balanceOwnerBefore))
    })
    it('mint error "Not correct value"', async () => {
        try {
            await nft.mint(2, 1, "0x0", {from: user4, value: price3})
        } catch (e) {
            assert.equal(e.message.includes("Not correct value"), true)
        }
    })
    it('mint user8', async () => {
        balanceUser8Before = web3.utils.fromWei(await web3.eth.getBalance(user8), "ether")
        balanceOwnerBefore = web3.utils.fromWei(await web3.eth.getBalance(owner), "ether")
        await nft.mint(3, 2, "0x0", {from: user8})
        balanceUser8After = web3.utils.fromWei(await web3.eth.getBalance(user8), "ether")
        balanceOwnerAfter = web3.utils.fromWei(await web3.eth.getBalance(owner), "ether")
        assert.equal(Math.round(balanceUser8Before-balanceUser8After), Math.round(balanceOwnerAfter-balanceOwnerBefore))
    })
    it('setMoneyReceiver + event SetMoneyReceiver', async () => {
        SetMoneyReceiver = await nft.setMoneyReceiver(moneyReceiver)
        const log = SetMoneyReceiver.logs[0]
        assert.equal(log.event, 'SetMoneyReceiver')
        const event = log.args
        assert.equal(event.newMoneyReceiver, moneyReceiver)
    })
    it('mint user5', async () => {
        balanceUser5Before = web3.utils.fromWei(await web3.eth.getBalance(user5), "ether")
        balanceMoneyReceiverBefore = web3.utils.fromWei(await web3.eth.getBalance(moneyReceiver), "ether")
        await nft.mint(2, 1, "0x0", {from: user5, value: price2})
        balanceUser5After = web3.utils.fromWei(await web3.eth.getBalance(user5), "ether")
        balanceMoneyReceiverAfter = web3.utils.fromWei(await web3.eth.getBalance(moneyReceiver), "ether")
        assert.equal(Math.round(balanceUser5Before-balanceUser5After), Math.round(balanceMoneyReceiverAfter-balanceMoneyReceiverBefore))
    })
})