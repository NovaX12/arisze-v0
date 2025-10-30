import { firestoreDb } from './firebase'

export async function initializeDatabase() {
  try {
    // Initialize sample events in Firestore
    const events = [
      {
        title: "Board Game Night",
        description: "Join us for an evening of fun board games and socializing!",
        location: "Cozy Corner Cafe",
        image: "/cozy-cafe-with-board-games.jpg",
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        time: "19:00",
        tags: ["Board Games", "Social"],
        attendees: 12,
        maxAttendees: 20,
        university: "Kaunas University of Technology",
        createdBy: "system",
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Study Group Session",
        description: "Collaborative study session for computer science students.",
        location: "Academic Grounds",
        image: "/modern-study-cafe-with-students.jpg",
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        time: "14:00",
        tags: ["Study", "Academic"],
        attendees: 8,
        maxAttendees: 15,
        university: "Kaunas University of Technology",
        createdBy: "system",
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Live Acoustic Music",
        description: "Enjoy live acoustic music performance in a cozy atmosphere.",
        location: "Melody Lounge",
        image: "/intimate-cafe-with-acoustic-guitar-performance.jpg",
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Friday
        time: "20:00",
        tags: ["Live Music", "Entertainment"],
        attendees: 25,
        maxAttendees: 30,
        university: "Kaunas University of Technology",
        createdBy: "system",
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Art & Coffee Workshop",
        description: "Express your creativity while enjoying great coffee!",
        location: "Creative Beans",
        image: "/artistic-cafe-with-painting-supplies.jpg",
        date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // Saturday
        time: "10:00",
        tags: ["Art", "Workshop"],
        attendees: 6,
        maxAttendees: 12,
        university: "Kaunas University of Technology",
        createdBy: "system",
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    // Initialize badges
    const badges = [
      {
        name: "First Event",
        description: "Attended your first event",
        icon: "🎉",
        color: "#8a3ffc",
        requirements: {
          type: "events_attended",
          value: 1
        },
        createdAt: new Date()
      },
      {
        name: "Social Butterfly",
        description: "Attended 10 events",
        icon: "🦋",
        color: "#ff4d6d",
        requirements: {
          type: "events_attended",
          value: 10
        },
        createdAt: new Date()
      },
      {
        name: "Profile Complete",
        description: "Completed your profile",
        icon: "✅",
        color: "#a259ff",
        requirements: {
          type: "profile_complete",
          value: 100
        },
        createdAt: new Date()
      },
      {
        name: "Content Creator",
        description: "Created 5 posts",
        icon: "✍️",
        color: "#4ade80",
        requirements: {
          type: "posts_created",
          value: 5
        },
        createdAt: new Date()
      }
    ]

    // Insert data into Firestore collections using batch write
    const batch = firestoreDb.batch()
    
    // Add events to batch
    events.forEach(event => {
      const eventRef = firestoreDb.collection('events').doc()
      batch.set(eventRef, event)
    })
    
    // Add badges to batch
    badges.forEach(badge => {
      const badgeRef = firestoreDb.collection('badges').doc()
      batch.set(badgeRef, badge)
    })
    
    // Commit the batch
    await batch.commit()

    // Database initialization completed successfully
    return { success: true }
  } catch (error) {
    console.error('Error initializing database:', error)
    return { success: false, error }
  }
}

