export function toDurationString(seconds?: number): string | undefined {

    if (!seconds) return undefined;

    const hours = Math.floor(seconds / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);

    var durationString = "";
    durationString += hours + " hour"
    if (hours != 1) durationString += "s"
    if (minutes > 0) {
        durationString += ", " + minutes + " minute"
        if (minutes != 1) durationString += "s"
    }
    return durationString;
}