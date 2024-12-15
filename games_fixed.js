
window.onload = function() {
    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let timer;
    let gamePaused = false;
    let timerValue = 15; // Timer set to 15 seconds

    // Fetch questions from Open Trivia Database API
    async function fetchQuestions(category, difficulty) {
        const url = `https://opentdb.com/api.php?amount=10&category=${category}&difficulty=${difficulty}&type=multiple`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data && data.results.length > 0) {
                questions = data.results;
                startNewRound();
            } else {
                console.error('No questions available from API.');
                alert("No questions available for the selected category and difficulty.");
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
            alert("Error loading questions. Please check your internet connection and try again.");
        }
    }

    // Start the game
    function startGame() {
        if (!gamePaused) {
            const categoryElement = document.getElementById("category");
            const difficultyElement = document.getElementById("difficulty");

            if (!categoryElement || !difficultyElement) {
                console.error('Category or difficulty dropdown not found.');
                return;
            }

            const category = categoryElement.value;
            const difficulty = difficultyElement.value;
            score = 0;
            document.getElementById("score").textContent = "Score: " + score;
            document.getElementById("startButton").disabled = true; // Disable start button
            fetchQuestions(category, difficulty);
        }
    }

    // Start a new round
    function startNewRound() {
        if (questions.length > 0) {
            currentQuestionIndex = 0;
            displayQuestion();
            startTimer();
        } else {
            alert('No questions available to display.');
        }
    }

    // Display the current question
    function displayQuestion() {
        const currentQuestion = questions[currentQuestionIndex];
        const questionElement = document.getElementById('question');

        if (!questionElement) {
            console.error('Question element not found.');
            return;
        }

        questionElement.textContent = currentQuestion.question;
        
        const options = shuffleArray([
            ...currentQuestion.incorrect_answers,
            currentQuestion.correct_answer
        ]);
        
        for (let i = 0; i < 4; i++) {
            const optionElement = document.getElementById(`option${i}`);
            if (optionElement) {
                optionElement.textContent = options[i] || 'N/A';
                optionElement.classList.remove('correct', 'incorrect'); // Reset option styles
            } else {
                console.error(`Option button option${i} not found.`);
            }
        }
    }

    // Shuffle array to randomize the options
    function shuffleArray(array) {
        return array.sort(() => Math.random() - 0.5);
    }

    // Handle answer selection
    function selectAnswer(selectedIndex) {
        if (gamePaused) return;

        const currentQuestion = questions[currentQuestionIndex];
        const selectedOption = document.getElementById(`option${selectedIndex}`);

        if (!selectedOption) {
            console.error(`Option button option${selectedIndex} not found.`);
            return;
        }

        const selectedAnswer = selectedOption.textContent;
        const correctAnswer = currentQuestion.correct_answer;

        if (selectedAnswer === correctAnswer) {
            selectedOption.classList.add('correct');
            score++;
        } else {
            selectedOption.classList.add('incorrect');
            // Highlight the correct answer if the selected answer is wrong
            for (let i = 0; i < 4; i++) {
                const optionElement = document.getElementById(`option${i}`);
                if (optionElement && optionElement.textContent === correctAnswer) {
                    optionElement.classList.add('correct');
                }
            }
        }

        document.getElementById('score').textContent = "Score: " + score;

        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                resetOptions();
                displayQuestion();
                startTimer();
            } else {
                alert(`Game Over! Your final score is: ${score}`);
                document.getElementById("startButton").disabled = false;
            }
        }, 1000);
    }

    // Timer for each question
    function startTimer() {
        let timeLeft = timerValue;
        const timerElement = document.getElementById('timer');

        if (!timerElement) {
            console.error('Timer element not found.');
            return;
        }

        timerElement.textContent = `Time Left: ${timeLeft}`;
        
        // Clear any existing timer to prevent overlap
        if (timer) {
            clearInterval(timer);
        }
        
        timer = setInterval(() => {
            timeLeft--;
            timerElement.textContent = `Time Left: ${timeLeft}`;
            if (timeLeft <= 0) {
                clearInterval(timer);
                const correctAnswer = questions[currentQuestionIndex].correct_answer;
                // Automatically highlight the correct answer when time is up
                for (let i = 0; i < 4; i++) {
                    const optionElement = document.getElementById(`option${i}`);
                    if (optionElement && optionElement.textContent === correctAnswer) {
                        optionElement.classList.add('correct');
                    }
                }
                setTimeout(() => {
                    currentQuestionIndex++;
                    if (currentQuestionIndex < questions.length) {
                        resetOptions();
                        displayQuestion();
                        startTimer();
                    } else {
                        alert(`Game Over! Your final score is: ${score}`);
                        document.getElementById("startButton").disabled = false;
                    }
                }, 1000);
            }
        }, 1000);
    }

    // Pause the game
    function pauseGame() {
        gamePaused = true;
        clearInterval(timer);
        alert("Game paused");
    }

    // Reset options (clear previous answer highlights)
    function resetOptions() {
        const options = document.querySelectorAll('.btn');
        options.forEach(option => option.classList.remove('correct', 'incorrect'));
    }

    // Attach event listeners to buttons
    document.getElementById("startButton")?.addEventListener('click', startGame);
    document.getElementById("pauseButton")?.addEventListener('click', pauseGame);

    for (let i = 0; i < 4; i++) {
        document.getElementById(`option${i}`)?.addEventListener('click', () => selectAnswer(i));
    }
};
