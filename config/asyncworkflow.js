module.exports.asyncworkflow = {
  service: 'omeroservice',
  workflow: {
    createAndLink: [
      {start: 'create', next: 'link'},
      {start: 'link', next: 'end'}
    ]
  }
};
