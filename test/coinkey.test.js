var assert = require('assert')
var CoinKey = require('../')
var secureRandom = require('secure-random')

var fixtures = require('./fixtures/coinkey')

describe('CoinKey', function() {
  describe('- CoinKey()', function() {
    describe('> when private key passed', function() {
      it('should return an instance of CoinKey with fields set', function() {
        var privateKey = secureRandom.randomBuffer(32)
        var ck = new CoinKey(privateKey)
        assert(ck.compressed)
        assert.equal(ck.privateKey.toString('hex'), privateKey.toString('hex'))
      })
    })

    describe('> when private key and versions', function() {
      it('should return an instance of CoinKey with versions', function() {
        var dogecoin = fixtures.valid.filter(function(f) { if (f.description.match(/dogecoin/)) return f})[0]
        var ck = new CoinKey(new Buffer(dogecoin.privateKey, 'hex'), dogecoin.versions)
        assert(ck.compressed)
      })
    })

    describe('> when no private key', function() {
      it('should throw an error', function() {
        assert.throws(function() { var ck = new CoinKey() },/pass a private key/)
        assert.throws(function() { var ck = new CoinKey({public: 0, private: 0x80}) },/pass a private key/)
      })
    })
  })

  describe('- privateWif', function() {
    fixtures.valid.forEach(function(f) {
      it('should return the proper wif for ' + f.description, function() {
        var ck = new CoinKey(new Buffer(f.privateKey, 'hex'), f.versions)
        ck.compressed = false
        assert.equal(ck.privateWif, f.privateWif)
        var ckCompressed = new CoinKey(new Buffer(f.privateKey, 'hex'), f.versions)
        assert.equal(ckCompressed.privateWif, f.privateWifCompressed)
      })
    })
  })

  describe('- publicAddress', function() {
    fixtures.valid.forEach(function(f) {
      it('should return the proper public address for ' + f.description, function() {
        var ck = new CoinKey(new Buffer(f.privateKey, 'hex'), f.versions)
        ck.compressed = false
        assert.equal(ck.publicAddress, f.publicAddress)
        var ckCompressed = new CoinKey(new Buffer(f.privateKey, 'hex'), f.versions)
        assert.equal(ckCompressed.publicAddress, f.publicAddressCompressed)
      })
    })
  })


  describe('- toString()', function() {
    fixtures.valid.forEach(function(f) {
      it('should return the string ' + f.description, function() {
        var ck = new CoinKey(new Buffer(f.privateKey, 'hex'), f.versions)
        ck.compressed = false
        assert.equal(ck.toString(), f.privateWif + ': ' + f.publicAddress)
        var ckCompressed = new CoinKey(new Buffer(f.privateKey, 'hex'), f.versions)
        assert.equal(ckCompressed.toString(), f.privateWifCompressed + ': ' + f.publicAddressCompressed)
      })
    })
  })

  describe('+ fromWif()', function() {
    fixtures.valid.forEach(function(f) {
      it('should return a new CoinKey ' + f.description, function() {
        var ck = CoinKey.fromWif(f.privateWif)
        assert.equal(ck.compressed, false)
        assert.equal(ck.versions.private, f.versions.private)
        assert.equal(ck.versions.public, f.versions.public)
        assert.equal(ck.privateKey.toString('hex'), f.privateKey)
        assert.equal(ck.publicAddress, f.publicAddress)

        var ckCompressed = CoinKey.fromWif(f.privateWifCompressed)
        assert.equal(ckCompressed.compressed, true)
        assert.equal(ckCompressed.versions.private, f.versions.private)
        assert.equal(ckCompressed.versions.public, f.versions.public)
        assert.equal(ckCompressed.privateKey.toString('hex'), f.privateKey)
        assert.equal(ckCompressed.publicAddress, f.publicAddressCompressed)
      })
    })
  })

  describe('- versions', function() {
    describe('> when object changes', function() {
      it('should change the wif and public address', function() {
        var bitcoin = fixtures.valid.filter(function(f) { if (f.description.match(/bitcoin/)) return f })[0]
        var dogecoin = fixtures.valid.filter(function(f) { if (f.description.match(/bitcoin/)) return f })[0]

        var ck = new CoinKey(new Buffer(bitcoin.privateKey, 'hex'))
        assert.equal(ck.privateWif, bitcoin.privateWifCompressed)
        assert.equal(ck.publicAddress, bitcoin.publicAddressCompressed)

        ck.versions = dogecoin.versions //change to DOGECOIN

        assert.equal(ck.privateWif, dogecoin.privateWifCompressed)
        assert.equal(ck.publicAddress, dogecoin.publicAddressCompressed)

      })
    })

    describe('> when field changes', function() {
      it('should change the wif and public address', function() {
        var bitcoin = fixtures.valid.filter(function(f) { if (f.description.match(/bitcoin/)) return f })[0]
        var dogecoin = fixtures.valid.filter(function(f) { if (f.description.match(/bitcoin/)) return f })[0]

        var ck = new CoinKey(new Buffer(bitcoin.privateKey, 'hex'))
        assert.equal(ck.privateWif, bitcoin.privateWifCompressed)
        assert.equal(ck.publicAddress, bitcoin.publicAddressCompressed)

        //change to DOGECOIN
        ck.versions.private = dogecoin.versions.private
        ck.versions.public = dogecoin.versions.public

        assert.equal(ck.privateWif, dogecoin.privateWifCompressed)
        assert.equal(ck.publicAddress, dogecoin.publicAddressCompressed)
      })
    })
  })

  describe('+ createRandom()', function() {
    describe('> when no versions', function() {
      it('should create a random Bitcoin CoinKey', function() {
        var ck = CoinKey.createRandom()
        assert(ck.compressed)
        assert(ck.privateKey)
      })
    })

    describe('> when versions', function() {
      it('should create a random CoinKey with versions specified', function() {
        var dogecoin = fixtures.valid.filter(function(f) { if (f.description.match(/bitcoin/)) return f })[0]
        var ck = CoinKey.createRandom(dogecoin.versions)
        assert(ck.compressed)
        assert(ck.privateKey)
        assert.equal(ck.versions.private, dogecoin.versions.private)
        assert.equal(ck.versions.public, dogecoin.versions.public)
      })
    })
  })
})

