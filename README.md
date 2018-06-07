## A Sails Hook Redbox OMERO

In this example template you will find the barebones requirements for a Hook

This Project is divided between folders

## api

Main API of your Hook can be stored in controllers and services

- controllers
- services
  
## config & form-config

This configurations are redbox-portal dependent. They will allow redbox to be available as a record
If you require to have a form in your portal

- `config/recordtype`
- `config/workflow`
- `form-config/template-1.0-draft`

## index

Main entry point for the hook

### initialize

Init code before it gets hooked. 

### routes

Controller routes exposed to the sails front-end

```javascript
'get /your/route' : YourController.method
```

### configure

Add configuration and services to your sails app

```javascript
sails.services['YourService'] = function() { };
sails.config = _.merge(sails.config, {object});
```

## test

First run `npm install`

Test your sails hook with mocha by running `npm test` before adding the hook to your redbox-portal. 
It may cause your application to not lift.    

```sh
$ npm test

> @uts-eresearch/sails-hook-redbox-template@1.0.0 test /Users/moises/source/code.research/sails-hook-redbox-template
> NODE_ENV=test node_modules/.bin/mocha



  Basic tests ::
    ✓ should have a service
    ✓ should have a form
    ✓ should have a route
    ✓ sails does not crash


  4 passing (864ms)

```

For more information on testing your hook go to : https://sailsjs.com/documentation/concepts/testing


## Development in redbox-portal

There are several ways to code against it.

If you are using vagrant, place the code inside of the same machine/docker and do 

```bash
npm link
npm link sails-hook-redbox-omero
```

