 // Improved initialization with error handling
        document.addEventListener('DOMContentLoaded', function() {
            try {
                // Initialize all components
                initApp();
            } catch (error) {
                console.error("Initialization error:", error);
                document.getElementById('cakeMessage').textContent = "Something went wrong, but Happy Birthday anyway!";
            }
        });

        function initApp() {
            // Create floating decorations
            createHearts();
            createBalloons();
            setupLetterEffects();
            setupScrollToTop();
            
            // Set up candle functionality
            setupCandle();
            
            // Preload audio with better error handling
            preloadAudio();
            
            // Set up click/touch effects
            setupClickEffects();
            
            // Show audio player after a delay
            setTimeout(() => {
                document.getElementById('audioPlayer').classList.add('active');
            }, 3000);
        }

        // Create floating hearts
        function createHearts() {
            const container = document.getElementById('hearts-container');
            const colors = ['#ff6b9d', '#ff8fab', '#ffb8d9', '#ffdfeb'];
            
            for (let i = 0; i < 15; i++) {
                const heart = document.createElement('div');
                heart.innerHTML = '❤';
                heart.classList.add('heart');
                heart.style.left = Math.random() * 100 + '%';
                heart.style.top = Math.random() * 100 + '%';
                heart.style.fontSize = (Math.random() * 1.2 + 0.7) + 'rem';
                heart.style.animationDuration = (Math.random() * 3 + 3) + 's';
                heart.style.animationDelay = Math.random() * 4 + 's';
                heart.style.color = colors[Math.floor(Math.random() * colors.length)];
                container.appendChild(heart);
            }
        }

        // Create floating balloons
        function createBalloons() {
            const container = document.getElementById('balloons-container');
            
            for (let i = 0; i < 8; i++) {
                const balloon = document.createElement('div');
                balloon.classList.add('balloon');
                balloon.style.left = Math.random() * 100 + '%';
                balloon.style.bottom = -100 + 'px';
                balloon.style.animationDuration = (Math.random() * 4 + 6) + 's';
                balloon.style.animationDelay = Math.random() * 8 + 's';
                container.appendChild(balloon);
            }
        }

        // Make letters interactive
        function setupLetterEffects() {
            const letters = document.querySelectorAll('.letter');
            letters.forEach((letter) => {
                letter.addEventListener('click', () => {
                    letter.style.transform = `translateY(-5px) rotate(${Math.random() * 10 - 5}deg)`;
                    letter.style.background = `linear-gradient(135deg, ${getRandomColor()} 0%, ${getRandomColor()} 100%)`;
                    
                    setTimeout(() => {
                        letter.style.transform = '';
                        letter.style.background = 'linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%)';
                    }, 1000);
                });
            });
        }

        function getRandomColor() {
            const colors = ['#ff6b9d', '#ff8fab', '#ffb8d9', '#ffdfeb', '#a5d8ff', '#74c0fc'];
            return colors[Math.floor(Math.random() * colors.length)];
        }

        // Create confetti effect
        function createConfetti() {
            const colors = ['#ff6b9d', '#ffb8d9', '#ffdfeb', '#a5d8ff', '#74c0fc'];
            
            for (let i = 0; i < 60; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.width = Math.random() * 6 + 3 + 'px';
                confetti.style.height = Math.random() * 6 + 3 + 'px';
                confetti.style.animationDuration = Math.random() * 2 + 1.5 + 's';
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    confetti.remove();
                }, 3000);
            }
        }

        // Scroll to top button
        function setupScrollToTop() {
            const scrollButton = document.getElementById('scrollToTop');
            
            scrollButton.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
            
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 200) {
                    scrollButton.style.display = 'block';
                    setTimeout(() => {
                        scrollButton.style.opacity = '0.7';
                    }, 10);
                } else {
                    scrollButton.style.opacity = '0';
                    setTimeout(() => {
                        scrollButton.style.display = 'none';
                    }, 200);
                }
            });
        }

        // Candle functionality
        function setupCandle() {
            const flame = document.getElementById('flame');
            const smoke = document.getElementById('smoke');
            const cakeMessage = document.getElementById('cakeMessage');
            const permissionBtn = document.getElementById('permissionBtn');
            const instructions = document.getElementById('instructions');
            const manualBlowout = document.getElementById('manualBlowout');
            const audioPlayer = document.getElementById('audioPlayer');
            const birthdaySong = document.getElementById('birthdaySong');
            
            let isBlownOut = false;
            let audioContext, microphone, analyser;

            // Click fallback
            flame.addEventListener('click', blowOutCandle);
            
            // Manual blowout option
            manualBlowout.addEventListener('click', (e) => {
                e.preventDefault();
                blowOutCandle();
            });

            // Microphone permission handler
            permissionBtn.addEventListener('click', async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    microphone = audioContext.createMediaStreamSource(stream);
                    analyser = audioContext.createAnalyser();
                    analyser.fftSize = 128;
                    
                    microphone.connect(analyser);
                    
                    instructions.innerHTML = '<p>Now blow into your microphone to blow out the candle!</p>';
                    permissionBtn.style.display = 'none';
                    
                    detectBlowing();
                    
                } catch (err) {
                    instructions.innerHTML = '<p style="color:#ff6b9d">Could not access microphone. Click the candle flame instead!</p>';
                    console.error('Microphone access error:', err);
                }
            });

            // Improved microphone detection
            function detectBlowing() {
                if (isBlownOut) return;
                
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                let blowDetected = false;
                let silenceCount = 0;
                const BLOW_THRESHOLD = 60;
                const SILENCE_DURATION = 5;
                
                const checkVolume = () => {
                    analyser.getByteFrequencyData(dataArray);
                    
                    let sum = 0;
                    for (let i = 0; i < bufferLength; i++) {
                        sum += dataArray[i];
                    }
                    const average = sum / bufferLength;
                    
                    // Visual feedback when blowing is detected
                    if (average > BLOW_THRESHOLD * 0.7) {
                        flame.style.transform = 'scale(1.2)';
                    } else {
                        flame.style.transform = 'scale(1)';
                    }
                    
                    // Detect blowing
                    if (average > BLOW_THRESHOLD) {
                        blowDetected = true;
                        silenceCount = 0;
                    } else if (blowDetected) {
                        silenceCount++;
                        // Only trigger blowout after sustained silence following a blow
                        if (silenceCount > SILENCE_DURATION) {
                            blowOutCandle();
                            return;
                        }
                    }
                    
                    if (!isBlownOut) {
                        requestAnimationFrame(checkVolume);
                    }
                };
                
                checkVolume();
            }

            // Candle blowout function
            function blowOutCandle() {
                if (isBlownOut) return;
                isBlownOut = true;

                // Visual effects
                flame.style.animation = 'none';
                flame.style.transform = 'scale(0)';
                flame.style.opacity = '0';
                smoke.style.opacity = '1';
                smoke.style.transform = 'translateY(-15px)';
                instructions.style.opacity = '0';
                cakeMessage.textContent = "Your wish will come true! Happy Birthday Roshu! 🎉";
                
                // Create celebration effects
                createConfetti();
                
                // Play audio with interaction fallback
                playBirthdaySong();

                // Hide smoke after animation
                setTimeout(() => smoke.style.opacity = '0', 1500);
            }

            // Audio handling
            function playBirthdaySong() {
                birthdaySong.volume = 0.7;
                
                // Try to play immediately (works if user has interacted)
                const playPromise = birthdaySong.play();
                
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            audioPlayer.classList.add('playing');
                        })
                        .catch(error => {
                            console.log('Autoplay prevented, showing play button');
                            cakeMessage.textContent += " Tap the music button to play!";
                        });
                }
            }

            // Audio player toggle
            audioPlayer.addEventListener('click', function togglePlay() {
                if (birthdaySong.paused) {
                    birthdaySong.play()
                        .then(() => audioPlayer.classList.add('playing'))
                        .catch(e => console.log('Playback failed:', e));
                } else {
                    birthdaySong.pause();
                    audioPlayer.classList.remove('playing');
                }
            });
        }

        // Preload audio with error handling
        function preloadAudio() {
            const birthdaySong = document.getElementById('birthdaySong');
            
            // Set volume to 0 for silent preload
            birthdaySong.volume = 0;
            
            const playPromise = birthdaySong.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        birthdaySong.pause();
                        birthdaySong.currentTime = 0;
                        birthdaySong.volume = 0.7; // Reset to normal volume
                    })
                    .catch(e => {
                        console.log("Audio preloading failed - will require user interaction");
                    });
            }
        }

        // Click/touch effects
        function setupClickEffects() {
            document.addEventListener('click', function(e) {
                addHeart(e.clientX, e.clientY);
            });
            
            document.addEventListener('touchstart', function(e) {
                const touch = e.touches[0];
                addHeart(touch.clientX, touch.clientY);
            });
        }

        // Add heart animation at specific coordinates
        function addHeart(x, y) {
            const colors = ['#ff6b9d', '#ffb8d9', '#ffdfeb', '#a5d8ff', '#74c0fc'];
            const heart = document.createElement('div');
            heart.innerHTML = '❤';
            heart.style.position = 'fixed';
            heart.style.left = x + 'px';
            heart.style.top = y + 'px';
            heart.style.fontSize = (Math.random() * 12 + 6) + 'px';
            heart.style.color = colors[Math.floor(Math.random() * colors.length)];
            heart.style.pointerEvents = 'none';
            heart.style.transform = 'translate(-50%, -50%)';
            heart.style.zIndex = '1000';
            heart.style.animation = 'float 1.5s ease-out forwards';
            document.body.appendChild(heart);
            
            setTimeout(() => {
                heart.remove();
            }, 1500);
        }
    