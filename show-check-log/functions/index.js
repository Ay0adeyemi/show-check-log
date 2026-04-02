const functions = require("firebase-functions")
const admin = require("firebase-admin")

admin.initializeApp()

const db = admin.firestore()

exports.checkOverdueShows = functions.pubsub
.schedule("every 2 hours")
.onRun(async () => {

const showsSnapshot = await db.collection("shows").get()

for (const showDoc of showsSnapshot.docs) {

const showData = showDoc.data()
const checks = showData.checks || []

for (let i = 0; i < checks.length; i++) {

const check = checks[i]

const checkedAt = new Date(check.checkedAt)
const now = new Date()

const hoursSinceCheck = (now - checkedAt) / (1000 * 60 * 60)

if (hoursSinceCheck > 24) {

const lastSent = check.lastNotificationSent
  ? new Date(check.lastNotificationSent)
  : null

const hoursSinceLastNotification = lastSent
  ? (now - lastSent) / (1000 * 60 * 60)
  : null

const shouldNotify =
!lastSent || hoursSinceLastNotification > 12

if (shouldNotify) {

const usersSnapshot = await db
.collection("users")
.where("email", "==", check.checkedBy)
.get()

for (const userDoc of usersSnapshot.docs) {

const token = userDoc.data().fcmToken
if (!token) continue

await admin.messaging().send({
token: token,
notification: {
title: "Show Check Overdue",
body: `${showData.name} is overdue`
}
})

}

checks[i].lastNotificationSent = Date.now()

await showDoc.ref.update({ checks })

}

}

}

}

return null

})