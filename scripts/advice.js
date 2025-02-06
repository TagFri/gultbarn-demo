import {child} from "./child.js"
import {Lab} from "./lab.js"
import {myChart,lightCrossingPoint} from "./graph.js"
import {
    relativeDate2absoluteDate,
    absolute2relativeDate,
    currentLightLimitFromLastLab,
    printLabOverview,
    absoluteDateToPrintFormat
} from "./index.js";
export {updateAdvice}

function getAdvice() {
    class Advice {
        constructor(advice, title, description, icon, color="var(--color-yellow-lighter)") {
            this.advice = advice
            this.title = title
            this.description = description
            this.icon = icon
            this.color = color
        }
    }
    let url="assets/icons/advice/"
    const noAdvice = new Advice(
        "noAdvice",
        "Ingen råd fra pediatriveilederen",
        "Bilirubinverdien er lavere enn 50 µM under lysgrensa. Pediatriveilederen gir ingen konkrete råd ved ett enkelt målepunkt. Anvend klinisk skjønn, med en helhetlig vurdering av barnets klinikk og historikk.",
        url + "no_advice.svg",
        "var(--color-grey-light)"
    )
    const noFollowUp = new Advice(
        "noFollowUp",
        "Ingen oppfølging nødvendig",
        "Barnet trenger ikke videre blodprøvekontroller eller oppfølging for gulsott. Bilirubinnivåene er trygge, og det er ingen behov for lysbehandling eller annen behandling.",
        url + "no_follow_up.svg"
    );
    const bloodSample = new Advice(
        "bloodSample",
        "Blodprøvekontroll anbefales",
        `Barnet bør følges opp med en ny blodprøve for å kontrollere bilirubinnivåene. Se pediatriveilederen for diagnostiske vurderinger. <br><span class="bold">Krysningstidspunkt er SETTINN</span>`,
        url + "bloodtest.svg"
    );
    const lightTherapy = new Advice(
        "lightTherapy",
        "Lysbehandling anbefales",
        "Barnet har bilirubinnivåer som krever lysbehandling. Behandlingen bør startes snarest mulig.",
        url + "phototherapy.svg"
    );
    const prolongedIcterus = new Advice(
        "prolongedIcterus",
        "Prolongert ikterus - videre utredning anbefales",
        "Barn eldre enn 14 dager med synlig ikterus skal alltid utredes med total og konjugert bilirubin – uavhengig av vektoppgang og farge på avføring/urin. Et barn med konjugert bilirubin >17 mikromol/L skal følges opp videre.\n Se pediatriveilederen for diagnostiske vurderinger.",
        url + "prolonged_icterus.svg"
    );
    const earlyIcterus = new Advice(
        "earlyIcterus",
        "Ikterus første levedøgn - videre utredning anbefales",
        "Ikterus som oppstår første levedøgn regnes som patologisk. Videre utredning med blodprøver anbefales som angitt i pediatriveilederen, vurder lysbehandling.",
        url + "early_onset_icterus.svg"
    );
    const transfusion = new Advice(
        "transfusion",
        "Transfusjon anbefales",
        "Barnet har alvorlig høye bilirubinverdier. Barnet skal legges inn på sykehus umiddelbart og skal vurderes for utskiftningstransfusjon.",
        url + "transfusion.svg",
        "var(--color-light-red)"
    );
    const error = new Advice(
        "error",
        "Obs, her har det gått galt...",
        "Beregninger har feilet, vennligst trykk på 'Gi tilbakemelding' under, så skal vi jobbe på med å fikse feilen <3",
        url + "error.svg",
        "var(--color-grey-light)"
    )
    let advices = [noFollowUp, bloodSample, lightTherapy, prolongedIcterus, earlyIcterus, transfusion, noAdvice, error]
    if (Lab.getNumberOfLabs() == 0) {
        return(advices[advices.indexOf(noAdvice)])
    }
    console.log("GETADVICE CALLED")
    //Lab values
    let lastBilirubinValue = Lab.labs[Lab.getNumberOfLabs() - 1].bilirubin;
    let lastBilirubinDate = Lab.labs[Lab.getNumberOfLabs() - 1].timeDate;
    let lastBilirubinDate14 = new Date(lastBilirubinDate).setDate(lastBilirubinDate.getDate() + 14);
    let bilirubinSlope = Lab.getLabSlope();

    //Lightlimits
    let transfusionLimit = 100000;
    //todo sjekk om lab er over transfusjonsgrense
    let lightlimitStart = child.getLightLimit().data[1];
    let lightlimit = child.getLightLimit().data[10];
    let lightSlope = child.getLightLimit().slope;

    //Childinfo
    let gestastionWeek = child.gestationWeek;
    let birthDate = child.timeDate;

    //Extrapolationinfo
    let newLabDate = null
    if (myChart.data.datasets[2].data.length > 0) {
        newLabDate = relativeDate2absoluteDate(myChart.data.datasets[2].data[1].x)
    } else newLabDate = false

    console.log("TEST")
    console.log(lastBilirubinDate)
    console.log(absolute2relativeDate(lastBilirubinDate)>14)

    /* ADVICE ALGORITHEM; */
//TRANSFUSJON NEEEDED
    if (lastBilirubinValue >= gestastionWeek * 10
        ||bilirubinSlope > 240
        ||lastBilirubinValue > transfusionLimit) {
        console.log("ADVICE: transfusion-advice")
        return(advices[advices.indexOf(transfusion)])
//EARLY ICTERUS!
    } else if (absolute2relativeDate(lastBilirubinDate)<1) {
        console.log("ADVICE: early-icterus")
        return(advices[advices.indexOf(earlyIcterus)])
    }
//LIGHT THERAPY NEEDED
    else if (((lastBilirubinValue >= lightlimit) && ((absolute2relativeDate(lastBilirubinDate)) >= (Object.keys(child.getLightLimit().data).includes('3') ? 3 : 4))) || (lastBilirubinValue >=   (lightlimitStart + (lightSlope * (absolute2relativeDate(lastBilirubinDate)-1))) &&  (absolute2relativeDate(lastBilirubinDate) < Object.keys(child.getLightLimit().data).includes('3') ? 3 : 4))) {
        console.log("ADVICE: lighttherapy-advice")
        return(advices[advices.indexOf(lightTherapy)])
    }
//BLOOD SAMPLE FOLLOW UP
    else if ((bilirubinSlope > 0 && newLabDate && newLabDate < lastBilirubinDate14)
        || ((Lab.getNumberOfLabs() == 1) && (currentLightLimitFromLastLab() < 50))) {
        console.log("ADVICE: bloodsample-advice")
        return(advices[advices.indexOf(bloodSample)])
    }
//LATE ICTERUS
    else if (absolute2relativeDate(lastBilirubinDate)>14) {
        console.log("ADVICE: prolonged-icterus")
        return(advices[advices.indexOf(prolongedIcterus)])
    }
//NO FOLLOW UP NEEDED
        //newLabDate == False -> if extrapolation is calculated above 14 days
    else if (bilirubinSlope <= 0
        || !newLabDate) {
        console.log("ADVICE: no-follow-up")
        return(advices[advices.indexOf(noFollowUp)])
//NO ADVICE IN GUIDELINES
    } else if ((Lab.getNumberOfLabs() == 1) && (currentLightLimitFromLastLab() > 50)) {
        console.log("ADVICE: no-advice")
        return(advices[advices.indexOf(noAdvice)])
    }
//Error handling
    else {
        console.log("error-advice")
        console.log(newLabDate)
        console.log(lastBilirubinDate14)
        return(advices[advices.indexOf(error)])
    }
}

function updateAdvice() {
    //Get advice icon
    const adviceElement = getAdvice()
    console.log(adviceElement)
    if (adviceElement.advice === "bloodSample") {
        let crossing = relativeDate2absoluteDate(lightCrossingPoint().x)
        console.log(crossing)
        let crossingFormatted = absoluteDateToPrintFormat(crossing)
        console.log(crossingFormatted)
        adviceElement.description = adviceElement.description.replace("SETTINN", crossingFormatted)
    }
    console.log(adviceElement)
    //Create email template:
    let href = "mailto:hei@sablateknisk.no?subject=Gult barn&body="
        href += "%0A%0A%0A%0A"
        href += "AUTOGENERERT RAPPORT:%0A"
        href += "Råd: " + adviceElement.title + "%0A"
        href += "Beskrivelse: " + adviceElement.description + "%0A%0A"
        href += "BARNETS INFO:%0A"
        href += "Vekt:%09%09%09" + child.birthWeight + " gram%0A"
        href += "Fødselsdato:%09%09" + child.date[0] + "/" + child.date[1] + " kl: " + child.time[0] +":" + child.time[1] + "%0A"
        href += "Gestasjonsalder:%09" + child.gestationWeek + " uker%0A%0A"
        href += "BILIRUBIN PRØVER:%0A"
        href += printLabOverview().replace(/\n/g, '%0A')
    document.getElementById("feedback-button").children[1].href = href
    //Update advice title
    document.getElementById("advice-title").innerHTML = adviceElement.title
    //Update advice description
    document.getElementById("advice-paragraph").innerHTML = adviceElement.description
    //Update advice icon
    document.getElementById("advice-container").style.backgroundImage = `url('${adviceElement.icon}')`;
    //Upadte background color
    document.getElementById("advice-container").style.backgroundColor = `${adviceElement.color}`;
    //Show feedback button
    document.getElementById("feedback-button").classList.remove("hidden")

}