import axios from 'axios'

import { abi, address } from '../helpers/contract'
import { IPFS_URL } from '../helpers/ipfs'
import web3 from '../helpers/web3'
import ipfs from '../helpers/ipfs'

/** IPFS */

const getArticleData = async ipfsData => {
  const { data } = await axios.get(IPFS_URL + ipfsData)
  return data
}

const getArticleImageLink = ipfsImage => IPFS_URL + ipfsImage

/** Contract */
const contract = web3 && web3.eth && new web3.eth.Contract(abi, address)

export const getNumberOfArticles = async () => {
  try {
    const numberOfArticles = await contract.methods.articleCount().call()
    return parseInt(numberOfArticles, 10)
  } catch (err) {
    console.warn(err)
    return 0
  }
}

export const getArticle = async id => {
  try {
    const article = await contract.methods.articles(id).call()
    const { title, description } = await getArticleData(web3.utils.hexToAscii(article.data))
    const img = getArticleImageLink(web3.utils.hexToAscii(article.img))
    return { id, title, description, img, owner: article.owner, end: new Date(article.end * 1000) }
  } catch (err) {
    console.warn({ id }, err)
    return null
  }
}

export const getStandingBid = async articleId => {
  try {
    const bid = await contract.methods.getWinner(articleId).call()
    const value = web3.utils.fromWei(bid.standingBid_, 'ether')

    return {
      user: bid.winner_,
      value,
    }
  } catch (err) {
    console.warn({ articleId }, err)
    return null
  }
}

export const bidOnArticle = async (articleId, valueETH, user) => {
  const valueWei = web3.utils.toWei(valueETH, 'ether')
  const result = await contract.methods.addBid(articleId).send({
    from: user,
    value: valueWei,
  })

  return result
}

const uploadArticleIPFS = async (title, description, imageFile) => {
  const articleIpfs = {
    image: null,
    data: null,
  }

  const files = [
    {
      path: '/article.json',
      content: JSON.stringify({
        title,
        description,
      }),
    },
    {
      path: '/article.jpg',
      content: imageFile,
    },
  ]

  for await (const result of ipfs.add(files)) {
    if (result.path === 'article.jpg') {
      articleIpfs.image = web3.utils.asciiToHex(result.cid.string)
    }
    if (result.path === 'article.json') {
      articleIpfs.data = web3.utils.asciiToHex(result.cid.string)
    }
  }

  return articleIpfs
}

export const listArticle = async (title, description, imageFile, user) => {
  const article = await uploadArticleIPFS(title, description, imageFile)
  const result = await contract.methods.addArticle(article.data, article.image).send({
    from: user,
  })

  return result
}

export const getMoneyBack = async (articleId, user) => {
  const result = await contract.methods.getMoneyBack(articleId).send({
    from: user,
  })
  return result
}

export const getUserBid = async (articleId, user) => {
  const result = await contract.methods.getCurrentBid(articleId).call({ from: user })

  const value = web3.utils.fromWei(result, 'ether')

  return value
}
