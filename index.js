const async = require('async')
const path = require('path')
const dotenv = require('dotenv').config({path: path.resolve(__dirname, '_env')})
const fs = require('fs')
const rp = require('request-promise')
const _ = require('lodash')
const moment = require('moment')

const projects = JSON.parse(fs.readFileSync(path.resolve(__dirname, process.env.CONFIG_FILE), 'utf8'))

var resultObject = {}

const fromDate = moment().day(-7).format('YYYY-MM-DD')
const toDate = moment().day(0).format('YYYY-MM-DD')
const dates = `%3E%3C${fromDate}|${toDate}`

const requestOptions = {
  'headers': {
    'X-Redmine-API-Key': process.env.REDMINE_API_KEY
  },
  'json': true,
  'url': ''
}

async.each(
  // collection to iterate over
  projects,

  // function to execute for each item
  (project, cb) => {
    // console.log(`now processing ${project.name} ...`)
    const name = project.name
    const trackerIds = project.stock_ticket_types.join('|')
    const url = `${process.env.REDMINE_URL}?project_id=${project.id}&status_id=open&tracker_id=${trackerIds}`
    requestOptions.url = url
    rp(requestOptions)
      .then((res) => {
        if (resultObject[name]) {
          resultObject[name].open_issues = res.total_count
        } else {
          resultObject[name] = {'open_issues': res.total_count}
        }
        console.log(`STOCK: ${res.total_count} ${name}`)
        cb()
      })
      .catch((err) => {
        console.log(err.message)
        cb()
      })
  },

  // once all items finished
  (err) => {
    if (err) {
      console.log(`ERR: ${err}`)
    } else {
      // add stock
      async.reduce(resultObject, 0, (memo, i, cb) => {
        process.nextTick(function () {
          cb(null, memo + i.open_issues)
        })
      },
      (err, res) => {
        if (err) {
          console.log(`ERR: ${err}`)
        } else {
          console.log(`Overall stock: ${res}`)
        }
      })
    }
  }
)

async.each(
  // collection to iterate over
  projects,

  // function to execute for each item
  (project, cb) => {
    // console.log(`now processing ${project.name} ...`)
    const name = project.name
    const trackerIds = project.stock_ticket_types.join('|')
    const url = `${process.env.REDMINE_URL}?project_id=${project.id}&created_on=${dates}&tracker_id=${trackerIds}`
    requestOptions.url = url
    rp(requestOptions)
      .then((res) => {
        if (resultObject[name]) {
          resultObject[name].stock = res.total_count
        } else {
          resultObject[name] = {'stock': res.total_count}
        }
        console.log(`NEW: ${res.total_count} ${name}`)
        cb()
      })
      .catch((err) => {
        console.log(err.message)
        cb()
      })
  },

  // once all items finished
  (err) => {
    if (err) {
      console.log(`ERR: ${err}`)
    } else {
      // add stock
      async.reduce(resultObject, 0, (memo, i, cb) => {
        process.nextTick(function () {
          cb(null, memo + i.stock)
        })
      },
      (err, res) => {
        if (err) {
          console.log(`ERR: ${err}`)
        } else {
          console.log(`New tickets in the week between ${fromDate} and ${toDate}: ${res}`)
        }
      })
    }
  }
)
