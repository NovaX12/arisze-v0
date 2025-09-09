import { getDatabase } from './mongodb'

export async function initializeDatabase() {
  try {
    const db = await getDatabase()
    
    // Initialize universities
    const universities = [
      {
        name: "Vilnius University",
        thumbnail: "https://www.knf.vu.lt/modules/mod_news_pro_gk5/cache/default/defaultnsp-205.png",
        phone: "+370-5-2687001",
        email: "info@vu.lt",
        website: "https://www.vu.lt",
        address: "Universiteto g. 3, 01513 Vilnius, Lithuania",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Kaunas University of Technology",
        thumbnail: "https://ktu.edu/wp-content/uploads/2017/06/ktu_1.png",
        phone: "+370 (614) 20055",
        email: "klausk@ktu.lt",
        website: "https://en.ktu.edu",
        address: "K. Donelaičio g. 73, 44249 Kaunas, Lithuania",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Vytautas Magnus University",
        thumbnail: "https://www.vdu.lt/wp-content/uploads/2023/09/VDU_Jono-Petronio-nuotr.jpg",
        phone: "+370 37 751 175",
        email: "studentas@vdu.lt",
        website: "https://www.vdu.lt/en/",
        address: "K. Donelaičio g. 58, 44248 Kaunas, Lithuania",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    // Initialize cafes
    const cafes = [
      {
        name: "CAFFEINE LT",
        thumbnail: "https://lh3.googleusercontent.com/p/AF1QipOxqxBEYc9XUl3TzaGeHVrTWl40Nwy0xM37cJ6Y=s680-w680-h510-rw",
        phone: "+370 699 77541",
        email: "bendras@reitanconvenience.lt",
        activities: ["Board & Card Games", "Uno", "Jenga", "Social Games"],
        address: "Laisvės al. 60, 44309 Kaunas, Lithuania",
        university: "Kaunas University of Technology",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Vero Cafe",
        thumbnail: "https://lh3.googleusercontent.com/gps-cs-s/AC9h4npJs8E1vKciv15otVzZD05-FiyplJLfTm2c3Ra8A3KgrxDM8NAh8MezPsSNaW1PxT_IF4vEYx1f7ezTwk08wM-JjiEPggXpJwZb_YILqIN-CzHSZBo6tDO6yoB3GHhmAGasf=s294-w294-h220-n-k-no",
        phone: "+370 618 55401",
        email: "info@verocafe.lt",
        activities: ["Pictionary", "Trivia", "Creative Sessions", "Drawing"],
        address: "Laisvės al. 36, 44309 Kaunas, Lithuania",
        university: "Kaunas University of Technology",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Caif Cafe",
        thumbnail: "https://lh3.googleusercontent.com/gps-cs-s/AC9h4nq1jRXzOlWpWXl492ln18WWtwwuaZA0UZtLM-dTpnRqX1JIZ94msHMGXTl1MzFJtECsMDgspo-vTpwnNf42vLrihST9notX30LKYxJwN6-TzHIhm8GmQ78BZJ3dNTwMwCAQPefldw=s294-w294-h220-n-k-no",
        phone: "+370 699 02640",
        email: "info@caifcafe.lt",
        activities: ["Simple Puzzles", "Crosswords", "Sudoku", "Story Writing"],
        address: "K. Donelaičio g. 73, 44249 Kaunas, Lithuania",
        university: "Kaunas University of Technology",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    // Initialize sample events
    const events = [
      {
        title: "Board Game Night",
        description: "Join us for an evening of fun board games and socializing!",
        cafe: "Cozy Corner Cafe",
        image: "/cozy-cafe-with-board-games.jpg",
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        time: "19:00",
        tags: ["Board Games", "Social"],
        attendees: 12,
        maxAttendees: 20,
        university: "Kaunas University of Technology",
        contact: "info@cozycorner.lt",
        address: "Laisvės al. 60, 44309 Kaunas, Lithuania",
        createdBy: "system",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Study Group Session",
        description: "Collaborative study session for computer science students.",
        cafe: "Academic Grounds",
        image: "/modern-study-cafe-with-students.jpg",
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        time: "14:00",
        tags: ["Study", "Academic"],
        attendees: 8,
        maxAttendees: 15,
        university: "Kaunas University of Technology",
        contact: "study@academicgrounds.lt",
        address: "K. Donelaičio g. 73, 44249 Kaunas, Lithuania",
        createdBy: "system",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Live Acoustic Music",
        description: "Enjoy live acoustic music performance in a cozy atmosphere.",
        cafe: "Melody Lounge",
        image: "/intimate-cafe-with-acoustic-guitar-performance.jpg",
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Friday
        time: "20:00",
        tags: ["Live Music", "Entertainment"],
        attendees: 25,
        maxAttendees: 30,
        university: "Kaunas University of Technology",
        contact: "music@melodylounge.lt",
        address: "Laisvės al. 36, 44309 Kaunas, Lithuania",
        createdBy: "system",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Art & Coffee Workshop",
        description: "Express your creativity while enjoying great coffee!",
        cafe: "Creative Beans",
        image: "/artistic-cafe-with-painting-supplies.jpg",
        date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // Saturday
        time: "10:00",
        tags: ["Art", "Workshop"],
        attendees: 6,
        maxAttendees: 12,
        university: "Kaunas University of Technology",
        contact: "art@creativebeans.lt",
        address: "K. Donelaičio g. 58, 44248 Kaunas, Lithuania",
        createdBy: "system",
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

    // Insert data into collections
    await db.collection('universities').insertMany(universities)
    await db.collection('cafes').insertMany(cafes)
    await db.collection('events').insertMany(events)
    await db.collection('badges').insertMany(badges)

    console.log('Database initialized successfully!')
    return { success: true }
  } catch (error) {
    console.error('Error initializing database:', error)
    return { success: false, error }
  }
}

