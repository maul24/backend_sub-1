/* eslint-disable no-underscore-dangle */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist({ name }) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2,) RETURNING id',
      values: [id, name],
    };

    const result = await this._pool.query(query);

    if (!result.row[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.row[0].id;
  }
}

module.exports = PlaylistsService;
