export { bilirubinOpacity }

function bilirubinOpacity(boolean) {
    document.getElementById("bilirubinDate").disabled = boolean;
    document.getElementById("bilirubinTime").disabled = boolean;
    document.getElementById("bilirubinValue").disabled = boolean;
    document.getElementById("add-bilirubin").disabled = boolean;

    if (boolean) {
        document.getElementById("bilirubin-container").classList.add("opacity-container");
        document.getElementById("graph-container").classList.add("opacity-container");
    } else {
        document.getElementById("bilirubin-container").classList.remove("opacity-container");
        document.getElementById("bilirubinDate").focus()
        document.getElementById("graph-container").classList.remove("opacity-container");
    }
}