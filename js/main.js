let codes = []
function main() {
    let startIndex = 1 * (cleanText(window.location.hash.replaceAll("#", "")))
    console.debug("startindex", startIndex)
    if (!startIndex || typeof startIndex !== "number") {
        console.debug("startindex not a number", startIndex)
        startIndex = 0
    }

    let searchParams = new URLSearchParams(window.location.search)
    codes = [ searchParams.get("codes") || "" ]
    .flatMap((v) => v.split("\n"))
    .flatMap((v) => v.split(","))
    .flatMap((v) => v.split(" "))
    .flatMap((v) => v.split("+"))
    .map((v) => v.trim())
    .filter((v) => v !== "")

    console.debug("got codes", codes)
    showInputField(codes)
    showCode(startIndex)
}

let displayPane = $('#displayPane')
let inputPane = $('#inputPane')

function showInputField(codes) {
    $('.fieldContainer').each((t, cont) => { $(cont).remove() })
    if (codes.length == 0 ) {
        addBarcode($("#addBarcode"))
        return
    }

    for (let index = 0; index < codes.length; index++) {
        code = parseCode(index, codes[index])        
        addBarcode($("#addBarcode"), code.value, code.label, code.color)
    }
}

function lookupOrDefault(array, key, defaultValue) {
    const value = array[key];
    return value !== undefined ? value : defaultValue;
}


function parseCode(index, code) {
    const colors = [
        "darkgreen", "purple", "darkblue", "darkred", "grey",
    ]
    let ret = {
        value: "",
        label: "",
        color: "",
    }

    let codeParts = code.split(":")
    ret.value = codeParts[0] || ""
    ret.label = codeParts[1] || ""
    ret.color = codeParts[2] || colors[index % colors.length]

    ret.color = cleanText(ret.color)

    return ret
}

function showCode(index) {
    if (codes.length == 0) {
        return
    }
    index = Math.abs(index)
    index = index % codes.length
    console.debug("showing code", index)
    let code = parseCode(index, codes[index])

    let opts = {
        format: "CODE128B",
        text: code.label,
        textAlign: "middle",
        textPosition: "top",
        fontOptions: "bold",
        fontSize: 20,
        textMargin: 5,
    }

    console.debug("Using opts", opts)
    let d = $(`<div class='code' style='background-color:${cleanText(code.color)};'>`)
    let c = $("<canvas>")
    c.JsBarcode(code.value, opts)
    d.append(c)
    c.hammer({}).bind('swiperight swipeleft swipeup swipedown', (event) => {
            console.log("got swipe", event)
            if (event.type === "swipeup") {
                showCode(index - 1);
            } else if (event.type === "swipedown") {
                showCode(index + 1);
            } else if (event.type === "swiperight") {
                showCode(index + 1);
            } else if (event.type === "swipeleft") {
                showCode(index - 1);
            }
            event.preventDefault()
    })
    displayPane.empty()
    displayPane.append(d)

    window.location.hash = index
}

function cleanText(str) {
    return str.replace(new RegExp(`[^a-zA-Z0-9_., @#-]`, 'g'), '');
}

function processForm(event) {
    event.preventDefault()

    let newCodes = []

    $('.fieldContainer').each((t, cont) => {
        cont=$(cont)
        value = cont.children(".barcodeValue").first()[0].value
        label = cont.children(".barcodeLabel").first()[0].value
        color = cont.children(".barcodeColor").first()[0].value
        if (value == "") {
            return
        }
        newCodes.push([value, label, color].join(":"))
    });

    window.location = "./index.html?codes=" + encodeURIComponent(newCodes.join(","))
    
    return false
}

function clickAddBarcode(event) {
    event.preventDefault();
    addBarcode(event.target);
    return false;
}

function clickRemoveBarcode(event) {
    event.preventDefault();
    $(event.target).parent().remove()
    return false;
}

function addBarcode(target, value, label, color) {
    console.debug("Adding new barcode...", value, label, color)
    barcodeIndex = $(target).parent().children().length

    newFieldContainer = $(`<div id="fieldContainer_${barcodeIndex}" class="fieldContainer">`)

    newFieldContainer.append($(`<label for="barcodeValue_${barcodeIndex}">Value</label>`))
    valueField = $(`<input class='barcodeValue' name="barcodeValue_${barcodeIndex}" type="string" placeholder="Barcode Value" />`)
    valueField.val(value)
    newFieldContainer.append(valueField)

    newFieldContainer.append($(`<label for="barcodeLabel_${barcodeIndex}">Label</label>`))
    labelField = $(`<input class='barcodeLabel' name="barcodeLabel_${barcodeIndex}" type="string" placeholder="Label" />`)
    labelField.val(label)
    newFieldContainer.append(labelField)

    newFieldContainer.append($(`<label for="barcodeColor_${barcodeIndex}">Color</label>`))
    colorField = $(`<input class='barcodeColor' name="barcodeColor_${barcodeIndex}" type="color" />`)
    colorField.val(color)
    newFieldContainer.append(colorField)
    newFieldContainer.append($(`<button class='deleteButton' onClick="clickRemoveBarcode(event)">Remove</button>`))

    $(target).before(newFieldContainer)
}

main()

window.addEventListener('hashchange', function(event) {
    main()
})