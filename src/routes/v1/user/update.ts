// Copyright (C) 2023 Marcus Huber (xenorio) <dev@xenorio.xyz>
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { Handler } from 'express'
import mongo from '@util/mongo'
import sharp from 'sharp'
import { verifyUsername } from '@util/user'

interface UserUpdatePayload {
	about?: string;
	profile_picture?: string;
	username?: string;
}

export const post: Handler = async (req, res) => {

	if (!req.user) {
		res.status(401).json({
			status: 'ERROR',
			error: 'UNAUTHORIZED',
			message: 'Please log in first'
		})
		return
	}

	const data: UserUpdatePayload = {}

	if(req.body.username){

		if (!verifyUsername(req.body.username)) {
			res.status(403).json({
				status: 'ERROR',
				error: 'INVALID_USERNAME',
				message: 'The provided username invalid'
			})
			return
		}

		if (req.body.username != req.user.username &&await mongo.queryOne('Users', { username: req.body.username })) {
			res.status(403).json({
				status: 'ERROR',
				error: 'USER_EXISTS',
				message: 'A user with the supplied username already exists'
			})
			return
		}

		data.username = req.body.username

	}

	if(req.body.profile_picture){

		if(!isValidBase64Image(req.body.profile_picture)){
			res.status(403).json({
				status: 'ERROR',
				error: 'INVALID_IMAGE',
				message: 'The provided image seems to be corrupted or not supported'
			})
			return
		}

		data.profile_picture = req.body.profile_picture

	}

	mongo.update('Users', { _id: req.user._id }, data)
		.then(() => {
			res.json({
				status: 'SUCCESS'
			})
		})

}

function isValidBase64Image(base64String: string): boolean {
	// Regular expression to check if the string is a valid base64 image
	const base64Regex = /^data:image\/(jpeg|png|gif|bmp);base64,([A-Za-z0-9+/=])+$/

	if (!base64Regex.test(base64String)) {
		return false
	}

	// Check if the base64 string is properly padded
	const paddingIndex = base64String.indexOf('=')
	if (paddingIndex !== -1 && paddingIndex !== base64String.length - 1 && paddingIndex !== base64String.length - 2) {
		return false
	}

	// Check if the base64 string length is divisible by 4
	const base64StringLength = base64String.split('base64,')[1].length
	if (base64StringLength % 4 !== 0) {
		return false
	}

	// Decode the base64 string to a buffer and check if it's a valid image
	try {
		const buffer = Buffer.from(base64String.split(',')[1], 'base64')
		const image = sharp(buffer) // Use a library like "sharp" to process the image data
		return true
	} catch (error) {
		return false
	}
}