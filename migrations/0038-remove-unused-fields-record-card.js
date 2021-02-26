module.exports = function(migration) {
  const automatedRecordCard = migration.editContentType('automatedRecordCard');
  automatedRecordCard.deleteField('creator');
  automatedRecordCard.deleteField('provider');
  automatedRecordCard.deleteField('thumbnailUrl');
};
