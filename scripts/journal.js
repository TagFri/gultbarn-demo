export {copyContent}

let journal = "testjournal"
const copyContent = async () => {
    try {
        await navigator.clipboard.writeText(journal);
        console.log('Content copied to clipboard');
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
}