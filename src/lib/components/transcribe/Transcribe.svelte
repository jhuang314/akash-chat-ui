<script lang="ts">
  import CarbonMicrophone from "~icons/carbon/microphone";
  import CarbonMicrophoneFilled from "~icons/carbon/microphone-filled";
  import CarbonMicrophoneOff from "~icons/carbon/microphone-off";
  import createModule from "$lib/transcribe/shout/shout.wasm.js";
  //import createModule from "@transcribe/shout";
  import { StreamTranscriber  } from "$lib/transcribe";
  // import { preload, preloadModel } from "./transcribe.svelte.js";
  import { messageInput } from "$lib/stores/message";
  import { whisperLoading } from "$lib/stores/whisperLoading";
  import { onMount } from 'svelte';




  const modelFile = '/chatui/ggml-tiny-q5_1.bin';
  let transcribedText = '';

  let microphoneStart = false;
  let modelLoaded = false;
  let voiceActive = false;

  // Preload the model file to speed things up.
  onMount(() => {
  	console.log('the component has mounted');

   // fetch model file after confirm
   async function preload(modelFile, printConsole) {
      printConsole("Downloading model file... please wait.");
      whisperLoading.set(true);
      await fetch(modelFile);
      printConsole("Model file downloaded. You can now start transcribing.");
      whisperLoading.set(false);
      return true;
   }

   // check if model file is cached, if not, preload
   // change cache name to update model file in cache
   async function preloadModel(modelFile, printConsole = console.log) {
     const hasCache = await caches.has("model-v1");
     if (hasCache) return true;

     if (await preload(modelFile, printConsole)) {
       return true;
     } else {
       return false;
     }
   }

   preloadModel(
      modelFile,
      (msg) => (console.log(msg))
    ).then((loaded) => {
      if (loaded) {
        console.log('model loaded!');
        modelLoaded = true;
      }
    });
  });



  // create a new transcriber instance with callbacks
  const transcriber = new StreamTranscriber({
    createModule,

    audioWorkletsPath: '/transcribe/audio-worklets/',

    // model, you can try larger models, but they tend to be too slow for realtime transcription
    model: modelFile, // path to ggml model file

    // on transcribe callback
    onSegment: (result) => {
      console.log('got result', result);
      const resultText = result?.segment?.text;

      if (resultText.length) {
        messageInput.set(resultText);
      }
    },

    // on status change callback
    onStreamStatus: (status) => {
      console.log('got status', status);
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
