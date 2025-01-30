import {child} from "./child.js"
import {Lab} from "./lab.js"
import {myChart} from "./graph.js"
import {relativeDate2absoluteDate, absolute2relativeDate} from "./index.js";
export {updateAdvice}

function getAdvice() {
    class Advice {
        constructor(title, description, icon) {
            this.title = title
            this.description = description
            this.icon = icon
        }
    }
    let url="assets/icons/advice/"
    const noAdvice = new Advice(
        "Fagelig råd",
        "<br><br>",
        url + "outcome_box_inactive.svg"
    )
    const noFollowUp = new Advice(
        "Ingen oppfølging nødvendig",
        "Barnet trenger ikke videre blodprøvekontroller eller oppfølging for gulsott. Bilirubinnivåene er trygge, og det er ingen behov for lysbehandling eller annen behandling.",
        url + "no_follow_up.svg"
    );
    const bloodSample = new Advice(
        "Blodprøvekontroll anbefales",
        `Barnet bør følges opp med en ny blodprøve for å kontrollere bilirubinnivåene. Se pediatriveilederen for diagnostiske vurderinger. <br><span class="bold">Krysningstidspunkt om ${"fuck"} døgn</span>`,
        url + "bloodtest.svg"
    );
    const lightTherapy = new Advice(
        "Lysbehandling anbefales",
        "Barnet har bilirubinnivåer som krever lysbehandling. Behandlingen bør startes snarest mulig.",
        url + "phototherapy.svg"
    );
    const prolongedIcterus = new Advice(
        "Prolongert ikterus - videre utredning anbefales",
        "Barn eldre enn 14 dager med synlig ikterus skal alltid utredes med total og konjugert bilirubin – uavhengig av vektoppgang og farge på avføring/urin. Et barn med konjugert bilirubin >17 mikromol/L skal følges opp videre.\n Se pediatriveilederen for diagnostiske vurderinger.",
        url + "prolonged_icterus.svg"
    );
    const earlyIcterus = new Advice(
        "Ikterus første levedøgn - videre utredning anbefales",
        "Ikterus som oppstår første levedøgn regnes som patologisk. Videre utredning med blodprøver anbefales som angitt i pediatriveilederen, vurder lysbehandling.",
        url + "early_onset_icterus.svg"
    );
    const transfusion = new Advice(
        "Transfusjon anbefales",
        "Barnet har alvorlig høye bilirubinverdier. Barnet skal legges inn på sykehus umiddelbart og skal vurderes for utskiftningstransfusjon.",
        url + "transfusion.svg"
    );
    let advices = [noFollowUp, bloodSample, lightTherapy, prolongedIcterus, earlyIcterus, transfusion, noAdvice]
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
    //Transfusion
    if (lastBilirubinValue > gestastionWeek * 10
        ||bilirubinSlope > 240
        ||lastBilirubinValue > transfusionLimit) {
        console.log("transfusion-advice")
        return(advices[transfusion])
//EARLY ICTERUS
    } else if (absolute2relativeDate(lastBilirubinDate)<1) {
        return(advices[advices.indexOf(earlyIcterus)])
    }
//Lighttherapy
    else if (((lastBilirubinValue >= lightlimit) && ((absolute2relativeDate(lastBilirubinDate)) >= (Object.keys(child.getLightLimit().data).includes('3') ? 3 : 4))) || (lastBilirubinValue >=   (lightlimitStart + (lightSlope * (absolute2relativeDate(lastBilirubinDate)-1))) &&  (absolute2relativeDate(lastBilirubinDate) < Object.keys(child.getLightLimit().data).includes('3') ? 3 : 4))) {
        return(advices[advices.indexOf(lightTherapy)])
    }
//blood sample follow up
    else if ((bilirubinSlope > 0 && newLabDate && newLabDate < lastBilirubinDate14)
        || lastBilirubinValue > (lightlimit - 50)) {
        console.log("bloodsample-advice")
        return(advices[advices.indexOf(bloodSample)])
    }
//LATE ICTERUS
    else if (absolute2relativeDate(lastBilirubinDate)>14) {
        return(advices[advices.indexOf(prolongedIcterus)])
    }
//No advice
    else if (bilirubinSlope <= 0
        || (newLabDate != false && newLabDate > birthDate + 14)
        || lastBilirubinValue < (lightlimit - 50)) {
        //todo Bilirubinslope evalurere ikke?
        console.log("no-follow-up")
        return(advices[advices.indexOf(noFollowUp)])
    }
//Error handling
    else {
        console.log("no-advice")
        return(advices[advices.indexOf(noAdvice)])
    }
}

function updateAdvice() {
    //Get advice icon
    const adviceElement = getAdvice()
    //Update advice title
    document.getElementById("advice-title").innerHTML = adviceElement.title
    //Update advice description
    document.getElementById("advice-paragraph").innerHTML = adviceElement.description
    //Update advice icon
    document.getElementById("advice-container").style.backgroundImage = `url('${adviceElement.icon}')`;
    //Show feedback button
    document.getElementById("feedback-button").classList.remove("hidden")

}