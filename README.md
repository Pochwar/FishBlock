# FishBlock

a school project

##Installation and launch

- clone repository
- install with npm : `npm install`
- set configuration : copy `config/configExample.js` to `config/config.js` and set your DB and server configuration variables
- launch app with npm : `npm start`

## Linting code

- `npm run lint` To apply eslint for code in `./src`
- to create new rule, go to http://rapilabs.github.io/eslintrc-generator/ and copy new rules in `.eslintrc`, under the `rules` index

## Internationalisation

- languages files are in `locales` folder
- default language is 'fr'
- used language is store in a cookie
- to change language go to '/fr' or '/en'

Usage in twig templates :
`{{ __("LOCAL_VAR") }}` will display the value of "LOCAL_VAR" from the appropriate locale json file.

If "LOCAL_VAR" entry is not found is not found in the locale json file, it will be automatically created with a default value

##Faker

- set your db connection params and quantity of fake users in `config.config.json`
- create fake users with npm : `npm run faker`

