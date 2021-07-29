/* eslint-disable no-underscore-dangle */
const ClientError = require('../../exceptions/ClientError');

class PlaylistsongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postPlaylistsongsHandler = this.postPlaylistsongsHandler.bind(this);
    this.getPlaylistsongsHandler = this.getPlaylistsongsHandler.bind(this);
    this.deletePlaylistsongByIdHandler = this.deletePlaylistsongByIdHandler.bind(this);
  }

  async postPlaylistsongsHandler(request, h) {
    try {
      this._validator.validatePlaylistsongPayload(request.payload);
      const { songId } = request.payload;
      const { playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._service.verifyPlaylistAccess(playlistId, credentialId);
      await this._service.addPlaylistsong({
        playlistId, songId,
      });

      const response = h.response({
        status: 'success',
        message: 'Lagu telah ditambahkan ke playlist!',
      });

      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getPlaylistsongsHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const { playlistId } = request.params;

      await this._service.verifyPlaylistAccess(playlistId, credentialId);
      const songs = await this._service.getPlaylistsongs(credentialId);

      return {
        status: 'success',
        data: {
          songs: songs.rows.map((song) => ({
            id: song.id,
            title: song.title,
            performer: song.performer,
          })),
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async deletePlaylistsongByIdHandler(request, h) {
    try {
      const { songId } = request.payload;
      const { playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._service.verifyPlaylistAccess(playlistId, credentialId);
      await this._service.deletePlaylistsongById(playlistId, songId);

      return {
        status: 'success',
        message: 'Lagu telah terhapus dari playlist!',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = PlaylistsongsHandler;
