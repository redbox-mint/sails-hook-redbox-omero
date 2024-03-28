module.exports.routes  = {
  'get /:branding/:portal/ws/omero/info': 'OMEROController.info',
  'get /:branding/:portal/ws/omero/projects/:limit?/:offset?': 'OMEROController.projects',
  'post /:branding/:portal/ws/omero/login': 'OMEROController.login',
  'post /:branding/:portal/ws/omero/create': 'OMEROController.create',
  'post /:branding/:portal/ws/omero/link': 'OMEROController.link',
  'post /:branding/:portal/ws/omero/checkLink': 'OMEROController.checkLink'
};