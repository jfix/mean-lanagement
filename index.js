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

// stock of open support tickets
const openSupportTickets = (callback) => async.each(
  // collection to iterate over
  projects,

  // function to execute for each item
  (project, cb) => {
    // console.log(`now processing ${project.name} ...`)
    const name = project.name
    const trackerIds = project.support_ticket_types.join('|')
    const url = `${process.env.REDMINE_URL}?project_id=${project.id}&status_id=open&tracker_id=${trackerIds}`
    requestOptions.url = url
    rp(requestOptions)
      .then((res) => {
        if (resultObject[name]) {
          resultObject[name].support_stock = res.total_count
        } else {
          resultObject[name] = {'support_stock': res.total_count}
        }
        // console.log(`SUPPORT STOCK: ${name} ${res.total_count}`)
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
          cb(null, memo + i.support_stock)
        })
      },
      (err, res) => {
        if (err) {
          console.log(`ERR: ${err}`)
        } else {
          // console.log(`Open support ticket stock: ${res}`)
        }
      })
    }
    callback(null)
  }
)

// new support tickets last week
const newSupportTickets = (callback) => async.each(
  // collection to iterate over
  projects,

  // function to execute for each item
  (project, cb) => {
    const name = project.name
    const trackerIds = project.support_ticket_types.join('|')
    const url = `${process.env.REDMINE_URL}?project_id=${project.id}&created_on=${dates}&tracker_id=${trackerIds}`
    requestOptions.url = url
    rp(requestOptions)
      .then((res) => {
        if (resultObject[name]) {
          resultObject[name].support_new = res.total_count
        } else {
          resultObject[name] = {'support_new': res.total_count}
        }
        // console.log(`NEW SUPPORT: ${name} ${res.total_count}`)
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
          cb(null, memo + i.support_new)
        })
      },
      (err, res) => {
        if (err) {
          console.log(`ERR: ${err}`)
        } else {
          // console.log(`New support tickets in the week between ${fromDate} and ${toDate}: ${res}`)
        }
      })
    }
    callback(null)
  }
)

// new feature tickets last week
const newFeatureTickets = (callback) => async.each(
  // collection to iterate over
  projects,

  // function to execute for each item
  (project, cb) => {
    // console.log(`now processing ${project.name} ...`)
    const name = project.name
    const trackerIds = project.feature_ticket_types.join('|')
    const url = `${process.env.REDMINE_URL}?project_id=${project.id}&created_on=${dates}&tracker_id=${trackerIds}`
    requestOptions.url = url
    rp(requestOptions)
      .then((res) => {
        if (resultObject[name]) {
          resultObject[name].feature_new = res.total_count
        } else {
          resultObject[name] = {'feature_new': res.total_count}
        }
        // console.log(`NEW FEATURES: ${name} ${res.total_count}`)
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
          cb(null, memo + i.feature_new)
        })
      },
      (err, res) => {
        if (err) {
          console.log(`ERR: ${err}`)
        } else {
          // console.log(`New feature tickets in the week between ${fromDate} and ${toDate}: ${res}`)
        }
      })
    }
    callback(null)
  }
)

// stock of open feature tickets
const openFeatureTickets = (callback) => async.each(
  // collection to iterate over
  projects,

  // function to execute for each item
  (project, cb) => {
    // console.log(`now processing ${project.name} ...`)
    const name = project.name
    const trackerIds = project.feature_ticket_types.join('|')
    const url = `${process.env.REDMINE_URL}?project_id=${project.id}&status_id=open&tracker_id=${trackerIds}`
    requestOptions.url = url
    rp(requestOptions)
      .then((res) => {
        if (resultObject[name]) {
          resultObject[name].feature_stock = res.total_count
        } else {
          resultObject[name] = {'feature_stock': res.total_count}
        }
        // console.log(`FEATURE STOCK: ${name} ${res.total_count}`)
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
          cb(null, memo + i.feature_stock)
        })
      },
      (err, res) => {
        if (err) {
          console.log(`ERR: ${err}`)
        } else {
          // console.log(`Feature stock: ${res}`)
        }
      })
    }
    callback(null)
  }
)

async.parallel([
  openSupportTickets,
  newSupportTickets,
  openFeatureTickets,
  newFeatureTickets
],
(err, res) => {
  // do something with the results.

  // TODO: consolidate all values per ticket type
  //    - total of open support tickets
  //    - total of new support tickets
  //    - total of open feature tickets
  //    - total of new feature tickets
  console.log(JSON.stringify(resultObject))
}
)
