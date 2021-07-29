exports.up = (pgm) => {
  pgm.createTable('playlistsongs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      references: 'playlists',
      notNull: true,
    },
    music_id: {
      type: 'VARCHAR(50)',
      references: 'songs',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('playlistsongs');
};
