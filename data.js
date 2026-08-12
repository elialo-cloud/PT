const healthData = {

    user: {
        name: "Elias",
        device: "Garmin",
        connected: true
    },

    today: {
        steps: 12842,
        stepGoal: 15000,

        calories: 2341,
        calorieGoal: 2800,

        restingHeartRate: 58,

        bodyBattery: 74,

        stress: 31,

        hrv: 64,

        sleep: 7.7,
        sleepGoal: 8
    },

    training: {

        load: 74,

        loadGoal: 100,

        weeklyMinutes: 272,

        weeklyGoal: 300,

        workouts: [

            {
                type: "Running",
                name: "Löpning",
                date: "Idag",
                duration: 52,
                distance: 8.4,
                calories: 612,
                avgHeartRate: 151
            },

            {
                type: "Strength",
                name: "Styrketräning",
                date: "Igår",
                duration: 55,
                distance: 0,
                calories: 420,
                avgHeartRate: 128
            },

            {
                type: "Cycling",
                name: "Cykling",
                date: "9 aug",
                duration: 64,
                distance: 22.1,
                calories: 710,
                avgHeartRate: 142
            },

            {
                type: "Running",
                name: "Löpning",
                date: "8 aug",
                duration: 48,
                distance: 7.8,
                calories: 570,
                avgHeartRate: 148
            }

        ]

    },

    weekly: {

        labels: [
            "Mån",
            "Tis",
            "Ons",
            "Tor",
            "Fre",
            "Lör",
            "Sön"
        ],

        trainingLoad: [
            42,
            61,
            28,
            74,
            32,
            91,
            68
        ],

        steps: [
            8234,
            10482,
            7342,
            12840,
            9450,
            14321,
            12842
        ],

        heartRate: [
            64,
            61,
            66,
            59,
            62,
            57,
            58
        ],

        calories: [
            430,
            520,
            390,
            680,
            510,
            790,
            624
        ]

    },

    sleep: {

        lastNight: 7.7,

        goal: 8,

        score: 87,

        deep: 1.4,

        rem: 1.8,

        light: 4.5

    }

};
