// Cozy Pixel RPG - Game Configuration
const GAME_CONFIG = {
  // Opening Scene Text
  opening: {
    lines: [
      "Once upon a time...",
      "There was a beautiful prettiest princess...",
      "Who unknowingly changed someone's life forever."
    ],
    startPrompt: "Walk to begin your story."
  },

  // Interactive butterfly messages
  butterflyMessages: [
    "I love you my aşkooooo.",
    "You make me so happyyy.",
    "YOU'RE SO BEAUTIFUL OMG ILL CRY.",
    "i miss talking to you sm :(.",
    "You are my favourite cutu putu baby.",
  ],

  // Hidden cat dialogue messages
  catMessages: [
    "darshan loves you sooooooooooooooooo much",
    "miuw you look beautiful as usual everyday.",
    "welcome home, my princess."
  ],

  // Location 1: Cottage with Daisies (Insta)
  location1: {
    title: "our Beginning",
    text: "it all started when you came into my world. we spent hours running, climbing mountains, fighting bosses, and just talking. we spent sm time talking instead of playing the game only. i never knew that a simple game would lead me to the love of my life.",
    image: "assets/mehl.png", // Users can replace this with an actual image path
    caption: "the first adventure we shared "
  },

  // Location 2: Cozy House with Cats (WhatsApp)
  location2: {
    title: "the drawings that got us together",
    text: "(still remember exchanging our ig to send you my drawings, we spoke everyday and our conversations quickly grew from game talk to sharing our entire lives. we'd stay up until sunrise talking about anything and everything. seeing notifications from you were always the best part of my day and they still are. i still remember how i asked you out and you hesistated so i js waited till you answered omg also muheheheeh attached this photo of you which i love so so so much and youre sooooo beautiful my fine princess queen ;))",
    image: "assets/mehl2.jpg", // Users can replace this with an actual image path
    caption: "talking and spending time with you was and still is the best part of my day"
  },

  // Location 3: Cozy House with Cats (Big Chapter - Scroll)
  location3: {
    title: "when you said yes",
    // Large scroll text (comfortably fits long messages)
    text: `my dearest baby,

this was the day when my world finally made sense. i remember the nervousness in my chest and the hope in my heart. asking you to be my girlfriend was both the easiest and difficult and most important decision i have ever made. 

even though we are so far away, every single day with you feels like a beautiful dream. you have shown me what it means to be truly loved, supported, and cherished. when you told me that you love me omg my love you made me the happiest person in the universe.

here's to all our memories, all our video calls, our virtual dates, and the beautiful future we are building together. i can't wait for the day when there are no more goodbyes, only goodnights while sleeping next to you.

i love you with all i have in me my baby queen, today and forever.`,
    // Multiple image placeholders
    images: [
      { url: "assets/mehl3.jpg", caption: "WHATTA A BEAUTIFUL MODEL BABY" },
      { url: "assets/mehl4.jpg", caption: "need more mirror pics pls" },
      { url: "assets/WhatsApp Image 2026-07-18 at 01.41.24 (1).jpeg", caption: "call me sunflower the way ill always be facing you my star baby" },
      { url: "assets/WhatsApp Image 2026-07-18 at 01.46.16.jpeg", caption: "FACE CARD SLAY QUEEN DIVVAAAAAAA" }
    ]
  },

  // Location 4: Giant Pink Castle & Birthday Hall
  castle: {
    birthdayMessage: `HAPPY BIRTHDAY MY LOVELY BEAUTIFUL CUTU PUTU TINY AHH BABY WIFEEEEEE

my love, today is all about celebrating the most wonderful person in my life. you bring sm light, warmth, and sm happiness into my world. thank you for your kindness, your CUTU AHH LAUGH, and for being my partner in everything.

even though we are far apart right now, my heart is right there next to you, celebrating you and wishing I could hold you close and hug you so tight. i reallly hope this little world brings a smile to your face and reminds you of how incredibly special you are to me.

may this year bring you all the happiness, success, and love you deserve. i am so proud of you my mehlika baby and so grateful to be by your side. have the bestest day partying and eating cake my princess queen baby`,
    
    // Gallery of 8 photo frames (images will load with soft fade animations)
    gallery: [
      "assets/WhatsApp Image 2026-07-18 at 01.41.24.jpeg",
      "assets/WhatsApp Image 2026-07-18 at 01.41.55.jpeg",
      "assets/PHOTO-2026-07-18-02-01-49.jpg",
      "assets/WhatsApp Image 2026-07-18 at 01.46.14 (2).jpeg",
      "assets/WhatsApp Image 2026-07-18 at 01.46.14.jpeg",
      "assets/WhatsApp Image 2026-07-18 at 01.46.15 (1).jpeg",
      "assets/WhatsApp Image 2026-07-18 at 01.46.16 (1).jpeg",
      "assets/WhatsApp Image 2026-07-18 at 01.46.17.jpeg"
    ]
  },

  // Closing Text Sequence
  closing: {
    lines: [
      "no matter how far apart we are\nyou'll always be my favourite place to call home.",
      "happy birthday my prettiest baby aşkım",
      "i love you so much my princess",
      "forever yours,\nDarshan ❤️"
    ]
  }
};
export default GAME_CONFIG;
