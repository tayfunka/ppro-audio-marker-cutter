var TIMECODES = {
    TIMEDISPLAY_24Timecode: 100,
    TIMEDISPLAY_25Timecode: 101,
    TIMEDISPLAY_2997DropTimecode: 102,
    TIMEDISPLAY_2997NonDropTimecode: 103,
    TIMEDISPLAY_30Timecode: 104,
    TIMEDISPLAY_50Timecode: 105,
    TIMEDISPLAY_5994DropTimecode: 106,
    TIMEDISPLAY_5994NonDropTimecode: 107,
    TIMEDISPLAY_60Timecode: 108,
    TIMEDISPLAY_Frames: 109,
    TIMEDISPLAY_23976Timecode: 110,
    TIMEDISPLAY_16mmFeetFrames: 111,
    TIMEDISPLAY_35mmFeetFrames: 112,
    TIMEDISPLAY_48Timecode: 113,
    TIMEDISPLAY_AudioSamplesTimecode: 200,
    TIMEDISPLAY_AudioMsTimecode: 201
};

var sequence_default_timecode = TIMECODES.TIMEDISPLAY_25Timecode;

function storeDefaultTimecode() {
    if (app.project.activeSequence) {
        sequence_default_timecode = app.project.activeSequence.getSettings().videoDisplayFormat;
    }
}

function initialise() {
    storeDefaultTimecode();
}
initialise();


// 1. setTimecodeToFrames(): Ensures that the timecode display format is set to frames, which is necessary for accurate cutting at specific frames.
function setTimecodeToFrames() {
    var seq = app.project.activeSequence;
    if (seq) {
        var currentSeqSettings = app.project.activeSequence.getSettings();
        if (currentSeqSettings.videoDisplayFormat != TIMECODES.TIMEDISPLAY_Frames) {
            currentSeqSettings.videoDisplayFormat = TIMECODES.TIMEDISPLAY_Frames;
            app.project.activeSequence.setSettings(currentSeqSettings);
        }
    }
}

// 2. razorSequenceAtFrames(frames): Cuts (razors) the active sequence at the specified frame number. This function first ensures the sequence is displayed in frames, then calls the razor() method with the frame number.
function razorSequenceAtFrames(frames) {
    setTimecodeToFrames();
    qe.project.getActiveSequence().razor(frames);
}


// 3. razorSequenceAtSeconds(seconds): Converts seconds into frames and then razors the sequence at the corresponding frame. The conversion is based on the video frame rate of the active sequence.
function razorSequenceAtSeconds(seconds) {
    const frames = parseInt(Math.round(seconds / app.project.activeSequence.getSettings().videoFrameRate.seconds)).toString();
    razorSequenceAtFrames(frames);
}

// 4. razorTrackAtFrames(trackType, trackIndex, frames): Cuts a specific video or audio track at a given frame number. It first ensures the timecode is in frames, then applies the cut.
function razorTrackAtFrames(trackType, trackIndex, frames) {
    setTimecodeToFrames();
    if (trackType == 'video') {
        qe.project.getActiveSequence().getVideoTrackAt(trackIndex).razor(frames);
    } else if (trackType == 'audio') {
        qe.project.getActiveSequence().getAudioTrackAt(trackIndex).razor(frames);
    }
}

// 5. razorTrackAtSeconds(trackType, trackIndex, seconds): Converts seconds into frames and then razors the specific track at the corresponding frame.
function razorTrackAtSeconds(trackType, trackIndex, seconds) {
    const frames = parseInt(seconds / app.project.activeSequence.getSettings().videoFrameRate.seconds).toString();
    razorTrackAtFrames(trackType, trackIndex, frames);
}


function getCutMarkers(sequence) {
    var a1 = sequence.audioTracks[0];
    return a1.clips[0].projectItem.getMarkers();

}


function rippleDelete(cut_markers, activeSequence) {

    var audio_tracks = new Array();
    for (var i = 0; i < activeSequence.audioTracks.numTracks; i++) {
        audio_tracks.push(activeSequence.audioTracks[i].clips)
    }
    $.writeln(audio_tracks.length)

    var video_tracks = new Array();
    for (var i = 0; i < activeSequence.videoTracks.numTracks; i++) {
        video_tracks.push(activeSequence.videoTracks[i].clips)
    }
    for (var marker = cut_markers.numMarkers - 1; marker >= 0; marker--) { // tüm marker'ları dolaş
        var marker_start_frame = parseInt(Math.round(cut_markers[marker].start.seconds / app.project.activeSequence.getSettings().videoFrameRate.seconds)).toString();
        var isAudioBreak = false
        var isVideoBreak = false


        for (var clip = audio_tracks[0].length - 1; clip >= 0; clip--) { // a0' daki tüm klipleri dolaş
            var audio_clip_start_frame = parseInt(Math.round(audio_tracks[0][clip].start.seconds / app.project.activeSequence.getSettings().videoFrameRate.seconds)).toString();

            if (marker_start_frame === audio_clip_start_frame) {
                for (var audio_track = 0; audio_track < audio_tracks.length; audio_track++) {
                    audio_tracks[audio_track][clip].remove(true, true)
                    isAudioBreak = true;
                }
            }
            if (isAudioBreak) break;
        }

        for (var clip = video_tracks[0].length - 1; clip >= 0; clip--) { // a0' daki tüm klipleri dolaş
            var video_clip_start_frame = parseInt(Math.round(video_tracks[0][clip].start.seconds / app.project.activeSequence.getSettings().videoFrameRate.seconds)).toString();

            if (marker_start_frame === video_clip_start_frame) {
                for (var video_track = 0; video_track < video_tracks.length; video_track++) {
                    video_tracks[video_track][clip].remove(true, true)
                    isVideoBreak = true;
                }
            }
            if (isVideoBreak) break;
        }
    }
    activeSequence.setInPoint(video_tracks[0][0].start.seconds);
    activeSequence.setOutPoint(video_tracks[0][video_tracks[0].numTracks - 1].end.seconds);
}

function razorTracks(cut_markers) {

    for (var marker = 0; marker < cut_markers.numMarkers; marker++) {
        var time_in = cut_markers[marker].start.seconds;
        var time_out = cut_markers[marker].end.seconds;

        razorSequenceAtSeconds(time_in)
        razorSequenceAtSeconds(time_out)
    };
}

initialise();
var qe = app.enableQE();
var activeSequence = app.project.activeSequence;
var cut_markers = getCutMarkers(activeSequence);
razorTracks(cut_markers)
rippleDelete(cut_markers, activeSequence)






$.writeln('markers deleted.')
