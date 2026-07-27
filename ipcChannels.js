const sendChannels = Object.freeze([
    'add-normal-task',
    'add-timed-task',
    'add-imaged-task',
    'new-normal-task',
    'new-timed-task',
    'new-imaged-task',
    'notify',
    'upload-image',
    'create-txt',
    'copy-image',
    'delete-image',
]);

const receiveChannels = Object.freeze([
    'add-normal-task',
    'add-timed-task',
    'add-imaged-task',
    'open-file',
]);

module.exports = { sendChannels, receiveChannels };
