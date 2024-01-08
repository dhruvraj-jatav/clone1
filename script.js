console.log('lets write js');

let currentSong = new Audio();
let songs;
let currFolder;

function convertSecondsToMinutesAndSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
    const formattedSeconds = remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder
    const newLocal = await fetch(`/${folder}/`);
    let a = newLocal
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        // if(element.href.endsWith(".mp3.preview")){
        // songs.push(element.href.split("/songs/")[1])
        if (element.href.endsWith(".mp3.preview")) {
            let trackName = (element.href.split(`/${folder}/`)[1]);
            // Remove ".preview" from the end of the track name
            trackName = trackName.replace(".preview", "");
            songs.push(trackName);
        }
    }



    // show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> 
         <img class="invert" src="img/music.svg" alt="">
         <div class="info">
             <div> ${song.replaceAll("%20", " ")} </div>
             <div> </div>
         </div>
         <div class="playnow">
             <span>Play Now</span>
             <img class="invert" src="img/play.svg" alt="">
         </div> </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })

    })
    return songs
}

function playMusic(track, pause = false) {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    currentSong.play();
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    console.log("displaying albums")
    const newLocal_1 = await fetch("songs/");
    let a = newLocal_1;
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            try {
                // get the metadata of the folder
                let a = await fetch(`/songs/${folder}/info.json`);
                if (a.ok) {
                    let response = await a.json();
                    console.log(response);
                    cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="16" height="16" viewbox="0 0 24 24" fill="fill"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`;
                }
                else {
                    console.error(`Error fetching JSON for folder ${folder}: ${a.statusText}`);
                }
            } catch (error) {
                console.error(`Error parsing JSON for folder ${folder}: ${error}`);
            }
        }
    }
    //load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}

async function main() {


    // get the list of all the songs
    await getSongs("songs/Animal")
    playMusic(songs[0], true)

    // display all the albums on the page
    displayAlbums()



    //attach an event listener to paly next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    //listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        const currentTimeInSeconds = Math.round(currentSong.currentTime);
        const durationInSeconds = Math.round(currentSong.duration);


        document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutesAndSeconds(currentTimeInSeconds)} / ${convertSecondsToMinutesAndSeconds(durationInSeconds)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    //add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    //add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    //add an event listener to previous 
    previous.addEventListener("click", () => {
        console.log("Previous clicked");
        let index = songs.indexOf((currentSong.src.split("/").slice(-1))[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    //add an event listener to next
    next.addEventListener("click", () => {
        console.log("Next clicked");

        let index = songs.indexOf((currentSong.src.split("/").slice(-1))[0])
        if ((index + 1) < songs.length - 1) {
            playMusic(songs[index + 1])
        }

    })

    //add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("setting volume to", e.target.value, "/ 100");
        currentSong.volume = parseInt(e.target.value) / 100
    })




    // add event listener to mute the track 
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })


}

main();
