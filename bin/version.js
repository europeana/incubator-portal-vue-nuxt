const path = require('path');
const propertiesReader = require('properties-reader');

const pkgVersion = require('../package').version;

const versionSonarProjectProperties = async() => {
  const sonarProjectPropertiesFilePath = path.resolve(__dirname, '../sonar-project.properties');
  const sonarProjectProperties = propertiesReader(sonarProjectPropertiesFilePath,
    'utf-8',
    { writer: { saveSections: false } }
  );
  sonarProjectProperties.set('sonar.projectVersion', pkgVersion);
  await sonarProjectProperties.save(sonarProjectPropertiesFilePath);
};

const version = async() => {
  await versionSonarProjectProperties();
};

version();
