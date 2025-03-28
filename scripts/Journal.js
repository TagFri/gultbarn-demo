import { Advice         } from "./Advice.js"
import { Child          } from "./Child.js"
import { GraphContainer } from "./GraphContainer.js";
import {Bilirubin       } from "./Bilirubin.js";

export {copyContent}

function copyContent() {

    //Hent referanse til barn
    const child = Child.getInstance()

    //Copy of chart image
    const image = GraphContainer.getInstance().myChart.toBase64Image();


    //Barnets vekt
    let barnetsVekt;
    if (child.birthWeight < 1000) { barnetsVekt = "<1000gram" }
    else if (child.birthWeight < 1500) { barnetsVekt = "1000-1499gram" }
    else if (child.birthWeight < 2500) { barnetsVekt = "1500-2499gram" }
    else if (child.birthWeight >= 2500) { barnetsVekt = ">=2500" }

    //Gestasjon vekt
    let gestation = (child.gestationWeek < 37)?"<37uker":">=37uker"

    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    }

    // Assembled Journal as HTML (with <b> formatting for bold)
    let htmlJournal = `
        <h3>Oppfølgning av bilirubinsvar</h3>
        <h4>Barnets informasjon:</h4>
        <p>Fødselstidspunkt: ${Child.getInstance().birthDateTime.toLocaleString("no-NO", options)} <br>
        Fødselsvekt: ${barnetsVekt}<br>
        Gestasjonsalder: ${gestation}</p>
        <h4>Anamnese:</h4>
        <p>Barnet er [aktivt/slapt/trøtt/irritabelt], og tar brystet [godt/dårlig]. Avføringen er [normal/blek] og urinen er [normal/mørk]. Synlig gulsott i huden er [bedre, lik, verre]. Foreldre bemerker [vektnedgang/vektoppgang].</p>
        <h4>Bilirubinverdier:</h4>
        <p>${Bilirubin.printBilirubinDetailedOverview().replace(/\n/g, '<br>')}</p>
        <h4>Anbefaling: ${Advice.currentAdvice.title}</h4>
        <p>${Advice.currentAdvice.description}</p>
        <h4>Informasjon til pårørende:</h4>
        <p>[FYLL INN INFO]</p>
        
        <p>Dersom barnet blir synlig gulere, må dere ta med barnet tilbake til barselavdelingen for å måle bilirubin. Dette er særlig viktig dersom barnet skulle bli påfallende slapt og ikke vil ta brystet, eller blir urolig/irritabel. Ring xxx xx xxx for å avtale prøven med barselavdelingen </p>
        <img style="width: 100px" src="${image}" alt="Bilubinverdier"></img>
    `;


    //Gjerne <br>
     let beskrivelse = Advice.currentAdvice.description.replace(/<br>/g, '\n')
        .replace(/Se [\s\S]*?for videre utredning./g, '')
        .replace(/<span class=\"semi-bold\">/g, "")
        .replace(/<\/span>/g, "")
        .replace(/<a class="link"[\s\S]*?target="_blank">/g)
        .replace(/<\/a>/g, "")

    // Plain Text Fallback
    let plainTextJournal = `
Oppfølgning av bilirubinsvar:
        
Barnets info:
Fødselstidspunkt: ${Child.getInstance().birthDateTime.toLocaleString("no-NO", options)}
Fødselsvekt: ${barnetsVekt} gram
Gestasjonsalder: ${barnetsVekt}
        
Anamnestisk informasjon:
Barnet er [aktivt/slapt/trøtt/irritabelt], og tar [godt/dårlig] til brystet.
Avføringen er [normal/blek] og urinen er [normal/mørk].
Ikterus i huden er [bedre, lik, værre].
Foreldre bemerker vekt[nedgang/oppgang].
        
Bilirubinverdier:
${Bilirubin.printBilirubinDetailedOverview()}
Anbefaling: ${Advice.currentAdvice.title}
${beskrivelse}
        
Mor informert om:
[FYLL INN INFO]
    `;

    // Write HTML Content to Clipboard
    const toClipboard = async () => {
        try {
            await navigator.clipboard.write([
                new ClipboardItem({
                    'text/html': new Blob([htmlJournal], { type: 'text/html' }),
                    'text/plain': new Blob([plainTextJournal], { type: 'text/plain' })
                })
            ]);
            console.log('Content copied to clipboard');
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    toClipboard();
}
















































