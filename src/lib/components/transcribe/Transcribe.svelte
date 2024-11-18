<script lang="ts">
  import CarbonMicrophone from "~icons/carbon/microphone";
  import CarbonMicrophoneFilled from "~icons/carbon/microphone-filled";
  import CarbonMicrophoneOff from "~icons/carbon/microphone-off";
  import createModule from "$lib/transcribe/shout/shout.wasm.js";
  //import createModule from "@transcribe/shout";
  import { StreamTranscriber  } from "$lib/transcribe";
  // import { preload, preloadModel } from "./transcribe.svelte.js";
  import { messageInput } from "$lib/stores/message";

  const modelFile = '/chatui/ggml-tiny-q5_1.bin';
  let transcribedText = '';

  let microphoneStart = false;
  let modelLoaded = false;
  let voiceActive = false;


  // preloadModel(
  //         modelFile,
  //         (msg) => (console.log(msg))
  //       ).then((loaded) => {
  //         modelLoaded = loaded;
  //         // if (loaded) {
  //         //   document.querySelector(".audio").removeAttribute("disabled");
  //         //   document.querySelector(".start").removeAttribute("disabled");
  //         //   document.querySelector(".stop").removeAttribute("disabled");
  //         // }
  //       });
modelLoaded = true;





  // create a new transcriber instance with callbacks
  const transcriber = new StreamTranscriber({
    createModule,

    audioWorkletsPath: '/transcribe/audio-worklets/',

    // model, you can try larger models, but they tend to be too slow for realtime transcription
    model: modelFile, // path to ggml model file

    // on transcribe callback
    onSegment: (result) => {
      // document.querySelector(".transcript").innerText =
      //   result?.segment?.text ?? "";
      console.log('got result', result);
      const resultText = result?.segment?.text;

      if (resultText.length) {
        messageInput.set(resultText);
      }
    },

    // on status change callback
    onStreamStatus: (status) => {
      console.log('got status', status);

      //document.querySelector(".status").innerText = status;
    },
  });

  // initialize the transcriber
    async function init() {
      try {
        await transcriber.init();
      } catch (error) {
        console.error("Error transcribing", error);
      }
    }

    // stream audio from a file
    let audio;

    async function stream() {
      console.log('stream starting');
      await init();
      // start waiting for audio
      await transcriber.start({ lang: "en" });

      // get the microphone audio stream
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then((stream) => {
          // transcribe the audio stream
          transcriber.transcribe(stream, {
            onVoiceActivity: (active) => {
              voiceActive = active;
            },
          });
        });
    }



  async function stopStream() {
    console.log('stream stopped');
    await transcriber.stop();
    audio?.pause();

  }

  let onclick = (event) => {
    microphoneStart = !microphoneStart;

    if (microphoneStart) {
      stream();
	} else {
	  stopStream();
	}



	event.preventDefault();
  };

</script>


<button
	class="btn mx-1 my-1 h-[2.4rem] self-end rounded-lg bg-transparent p-1 px-[0.7rem] text-gray-400 enabled:hover:text-gray-700 disabled:opacity-60 enabled:dark:hover:text-gray-100 dark:disabled:opacity-40"
	on:click={onclick}
	disabled={!modelLoaded}
	class:text-red-800={voiceActive}
>
    {#if (microphoneStart)}
        {#if (voiceActive)}
            <CarbonMicrophoneFilled />
        {:else}
            <CarbonMicrophone />
        {/if}
    {:else}
         <CarbonMicrophoneOff />
    {/if}

</button>
