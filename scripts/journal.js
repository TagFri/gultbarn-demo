import {child} from "./child.js"
import {Lab} from "./lab.js"
import {myChart} from "./graph.js"
export {copyContent}

function copyContent() {
    console.log("COPYCONTENT CALLED");

    var image = myChart.toBase64Image();
    console.log(image);

    // Generate Lab Overview
    let labOverview = "";
    for (const lab of Lab.labs) {
        let { time, date, bilirubin } = lab;
        let [hour, minute] = time;
        let [dateDay, dateMonth] = date;
        dateDay = dateDay.toString().padStart(2, "0");
        dateMonth = dateMonth.toString().padStart(2, "0");
        hour = hour.toString().padStart(2, "0");
        minute = minute.toString().padStart(2, "0");

        labOverview += `${dateDay}/${dateMonth} kl. ${hour}:${minute}: ${bilirubin} µmol/L\n`;
    }

    // Fetch Advice Information
    let adviceTitle = document.getElementById("advice-title").innerHTML;
    let adviceDescription = document.getElementById("advice-paragraph").innerHTML;

    // Assembled Journal as HTML (with <b> formatting for bold)
    let htmlJournal = `
        <h2>Oppfølgning av bilirubinsvar</h2>
        <h3>Barnets informasjon:</h3>
        <p>Fødselstidspunkt: &emsp;${child.date[0].toString().padStart(2, "0")}/${child.date[1].toString().padStart(2, "0")} - kl. ${child.time[0].toString().padStart(2, "0")}:${child.time[1].toString().padStart(2, "0")}<br>
        Fødselsvekt: &emsp;&emsp;&emsp;${child.birthWeight} gram<br>
        Gestasjonsalder: &emsp;${child.gestationWeek} uker (dager er ikke inkludert)</p>
        <h3>Anamnese:</h3>
        <p>Barnet er [aktivt/slapt/trøtt/irritabelt], og tar brystet [godt/dårlig]. Avføringen er [normal/blek] og urinen er [normal/mørk]. Synlig gulsott i huden er [bedre, lik, verre]. Foreldre bemerker [vektnedgang/vektoppgang].</p>
        <h3>Bilirubinverdier:</h3>
        <p>${labOverview.replace(/\n/g, '<br>')}</p>
        <h3>Anbefaling: ${adviceTitle}</h3>
        <p>${adviceDescription}</p>
        <h3>Informasjon til pårørende:</h3>
        <p>[FYLL INN INFO]</p>
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
        ${labOverview}
        
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
















































