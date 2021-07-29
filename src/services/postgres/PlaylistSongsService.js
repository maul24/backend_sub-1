/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongsService {
  constructor(collaborationService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
  }

  async addPlaylistsong({ playlistId, songId }) {
    const id = `plysg-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu telah gagal di tambahkan ke playlist.');
    }

    return result.rows[0].id;
  }

  async getPlaylistsongs(owner) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer FROM songs 
             LEFT JOIN playlistsongs ON playlistsongs.music_id = songs.id 
             LEFT JOIN playlists ON playlists.id = playlistsongs.playlist_id
             LEFT JOIN collaborations ON collaborations.playlist_id = playlistsongs.playlist_id
             WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result;
  }

  async deletePlaylistsongById(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 AND music_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal dihapus. Id tidak ditemukan!');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak memiliki hak untuk mengakses resource ini!');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistSongsService;
