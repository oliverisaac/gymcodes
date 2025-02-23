let codes = []
function main() {
    let searchParams = new URLSearchParams(window.location.search)
    codes = [ searchParams.get("codes") ]
    .flatMap((v) => v.split("\n"))
    .flatMap((v) => v.split(","))
    .flatMap((v) => v.split(" "))
    .flatMap((v) => v.split("+"))
    .map((v) => v.trim())
    .filter((v) => v !== "")

    console.debug("got codes", codes)
    if (codes.length == 0 ) {
        showInputField()
    } else {
        displayCodes()
    }
}

let displayPane = $('#displayPane')
let inputPane = $('#inputPane')

function showInputField() {
    console.debug("showing input field")
    displayPane.hide()
    inputPane.show()
}

function displayCodes() {
    console.debug("going to display codes")
    inputPane.hide()
    displayPane.show()
    showCode(0)
}

function showCode(index) {
    index = index % codes.length
    console.debug("showing code", index)
    let code=codes[index]
    const colors = [
        "darkgreen", "purple", "darkblue", "darkred", "grey",
    ]
    let d = $(`<div class='code' style='background-color:${colors[index % colors.length]}'>`)
    let c = $("<canvas>")
    c.JsBarcode(code, {
        format: "CODE128B",
    })
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
}


main()