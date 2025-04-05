
function storeDefaultTimecode(activeSequence) {
    if (activeSequence) {
        sequence_default_timecode = app.project.activeSequence.getSettings().videoDisplayFormat;
    }
}

function initialise(activeSequence) {
    storeDefaultTimecode(activeSequence);
}

function setTimecodeToFrames(activeSequence) {
    if (activeSequence) {
        var currentSeqSettings = activeSequence.getSettings();
        if (currentSeqSettings.videoDisplayFormat != TIMECODES.TIMEDISPLAY_Frames) {
            currentSeqSettings.videoDisplayFormat = TIMECODES.TIMEDISPLAY_Frames;
            activeSequence.setSettings(currentSeqSettings);
        }
    }
}

function razorSequenceAtFrames(frames, activeSequence) {
    setTimecodeToFrames(activeSequence);
    qe.project.getActiveSequence().razor(frames);
}

function razorSequenceAtSeconds(seconds) {
    const frames = parseInt(Math.round(seconds / app.project.activeSequence.getSettings().videoFrameRate.seconds - 4)).toString();
    razorSequenceAtFrames(frames);
}

function razorTrackAtFrames(trackType, trackIndex, frames) {
    setTimecodeToFrames();
    if (trackType == 'video') {
        qe.project.getActiveSequence().getVideoTrackAt(trackIndex).razor(frames);
    } else if (trackType == 'audio') {
        qe.project.getActiveSequence().getAudioTrackAt(trackIndex).razor(frames);
    }
}

function razorTrackAtSeconds(trackType, trackIndex, seconds) {
    const frames = parseInt(seconds / app.project.activeSequence.getSettings().videoFrameRate.seconds).toString();
    razorTrackAtFrames(trackType, trackIndex, frames);
}

function razor_sequences(hg_markers, activeSequence) {
    for (var marker = 0; marker < hg_markers.numMarkers; marker++) {
        var time_out = hg_markers[marker].end.seconds;

        for (var track_num = 0; track_num < activeSequence.videoTracks.numTracks; track_num++) {
            razorTrackAtSeconds('video', track_num, time_out)
        }
    };
}

function getHgMarkers() {
    for (var folder = 0; folder < app.project.rootItem.children.numItems; folder++) {
        if (app.project.rootItem.children[folder].name.indexOf('RAW') !== -1) {
            var rawFolder = app.project.rootItem.children[folder].children[0]
            $.writeln(rawFolder.name)
            break;
        }
    }
    for (var item = 0; item < rawFolder.children.numItems; item++) {
        if (rawFolder.children[item].name.indexOf('-hg') !== -1) {
            $.writeln(rawFolder.children[item].name)
            return rawFolder.children[item].getMarkers();

        }
    }
}
function removeClipsByHgMarkers(hg_markers, activeSequence) {
    var tracks = {
        '1': [1, 2, 3],
        '2': [0, 2, 3],
        '3': [0, 1, 3],
        '4': [0, 1, 2]
    };

    for (var marker = hg_markers.numMarkers - 1; marker >= 0; marker--) {
        var markerName = hg_markers[marker].name;
        var affectedTracks = tracks[markerName] || [];

        if (affectedTracks.length === 0) {
            $.writeln("Warning: No actions defined for marker name " + markerName);
            continue;
        }

        for (var i = 0; i < affectedTracks.length; i++) {
            var trackIndex = affectedTracks[i];
            var clips = activeSequence.videoTracks[trackIndex].clips;
            if (marker < clips.numItems) {
                clips[marker].remove(false, false);
            } else {
                $.writeln("Error: Clip index out of bounds for marker " + markerName + " on track " + (trackIndex + 1));
            }
        }
    }
}

function moveClipsToV1(activeSequence) {
    var num_tracks = activeSequence.videoTracks.numTracks;
    for (var t = 1; t < num_tracks; t++) {
        var video_track = qe.project.getActiveSequence().getVideoTrackAt(t);
        for (i = video_track.numItems - 1; i >= 0; i--) {
            var clip = video_track.getItemAt(i);
            if (clip.duration) {
                clip.moveToTrack(-3, 0, "0")
            }
        }
    }
}


function nestV1Clips(activeSequence) {

    for (var s = 0; s < activeSequence.videoTracks[0].clips.numItems; s++) {
        activeSequence.videoTracks[0].clips[s].setSelected(true, true)
    }
    var selection = activeSequence.getSelection();
    var start = selection[0].start;
    var end = selection[selection.length - 1].end;
    activeSequence.setInPoint(start.seconds);
    activeSequence.setOutPoint(end.seconds);
    var nestedSequence = activeSequence.createSubsequence(true);

    activeSequence.videoTracks[1].overwriteClip(nestedSequence.projectItem, start.seconds);

    var qe_active_sequence = qe.project.getActiveSequence();
    qe_active_sequence.removeVideoTrack(0)
    qe_active_sequence.removeAudioTrack(1)
    qe_active_sequence.removeEmptyVideoTracks()
    qe_active_sequence.removeEmptyAudioTracks()
}


// ------ VARIABLES ------
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
var qe = app.enableQE();
var activeSequence = app.project.activeSequence;
// ------ MAIN ------



var hg_markers = getHgMarkers();
razor_sequences(hg_markers, activeSequence);
removeClipsByHgMarkers(hg_markers, activeSequence);
moveClipsToV1(activeSequence);
nestV1Clips(activeSequence);

