import {child} from "./child.js"
import {Lab} from "./lab.js"
import {myChart} from "./graph.js"
import {printLabOverview} from "./index.js";
export {copyContent}

function copyContent() {
    console.log("COPYCONTENT CALLED");
    var image = myChart.toBase64Image();

    // Fetch Advice Information
    let adviceTitle = document.getElementById("advice-title").innerHTML;
    let adviceDescription = document.getElementById("advice-paragraph").innerHTML;

    // Assembled Journal as HTML (with <b> formatting for bold)
    let htmlJournal = `
        <h3>Oppfølgning av bilirubinsvar</h3>
        <h4>Barnets informasjon:</h4>
        <p>Fødselstidspunkt: &emsp;${child.date[0].toString().padStart(2, "0")}/${child.date[1].toString().padStart(2, "0")} - kl. ${child.time[0].toString().padStart(2, "0")}:${child.time[1].toString().padStart(2, "0")}<br>
        Fødselsvekt: &emsp;&emsp;&emsp;${child.birthWeight} gram<br>
        Gestasjonsalder: &emsp;${child.gestationWeek} uker (dager er ikke inkludert)</p>
        <h4>Anamnese:</h4>
        <p>Barnet er [aktivt/slapt/trøtt/irritabelt], og tar brystet [godt/dårlig]. Avføringen er [normal/blek] og urinen er [normal/mørk]. Synlig gulsott i huden er [bedre, lik, verre]. Foreldre bemerker [vektnedgang/vektoppgang].</p>
        <h4>Bilirubinverdier:</h4>
        <p>${printLabOverview().replace(/\n/g, '<br>')}</p>
        <h4>Anbefaling: ${adviceTitle}</h4>
        <p>${adviceDescription}</p>
        <h4>Informasjon til pårørende:</h4>
        <p>[FYLL INN INFO]</p>
        
        <p>Dersom barnet blir synelig gulere, må dere ta med barnet tilbake til barselavdelingen for å måle bilirubin. Dette er særlig viktig dersom barnet skulle bli påfallende slapt og ikke vil ta brystet, eller blir urolig/irritabel. Ring xxx xx xxx for å avtale prøven med barselavdelingen </p>
        <img style="width: 100px" src="${image}" alt="Bilubinverdier"></img>
    `;

    // Plain Text Fallback
    let plainTextJournal = `
        Oppfølgning av bilirubinsvar:
        
        Barnets info:
        Fødselstidspunkt: ${child.date[0]}/${child.date[1]} - kl. ${child.time[0]}:${child.time[1]}
        Fødselsvekt: ${child.birthWeight} gram
        Gestasjonsalder: ${child.gestationWeek} uker
        
        Anamnestisk informasjon:
        Barnet er [aktivt/slapt/trøtt/irritabelt], og tar [godt/dårlig] til brystet.
        Avføringen er [normal/blek] og urinen er [normal/mørk].
        Ikterus i huden er [bedre, lik, værre].
        Foreldre bemerker vekt[nedgang/oppgang].
        
        Bilirubinverdier:
        ${printLabOverview}
        
        Anbefalning: ${adviceTitle}
        ${adviceDescription}
        
        Mor informert om:
        [FYLL INN INFO]
    `;

    // Write HTML Content to Clipboard
    const copyContent = async () => {
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

    copyContent();
}
















































