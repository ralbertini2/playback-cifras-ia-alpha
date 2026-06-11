// Fluxo futuro IA — apenas orquestração mockada.
import * as stemSeparation from './stem-separation.service.js';
import * as transcription from './transcription.service.js';
import * as chordDetection from './chord-detection.service.js';
import * as keyDetection from './key-detection.service.js';
import * as lyricsGeneration from './lyrics-generation.service.js';
import * as pdfGeneration from './pdf-generation.service.js';

export async function runMockAiPipeline(song){
  return {
    song,
    steps: [
      await stemSeparation.process(song),
      await transcription.process(song),
      await keyDetection.process(song),
      await chordDetection.process(song),
      await lyricsGeneration.process(song),
      await pdfGeneration.process(song)
    ]
  };
}
