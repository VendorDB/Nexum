// Copyright (C) 2024 Marcus Huber (xenorio) <dev@xenorio.xyz>
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

export const post: Handler = async (req, res) => {

	if (req.bot) {
		res.status(403).json({
			status: 'ERROR',
			error: 'USER_ONLY',
			message: 'This endpoint is only available to users'
		})
		return
	}

	if (!req.user) {
		res.status(401).json({
			status: 'ERROR',
			error: 'UNAUTHORIZED',
			message: 'You must be logged in to do this'
		})
		return
	}

	const request = <VendorRequest> req.body

	request.author = {
		_id: req.user._id.toString(),
		username: req.user.username
	}
	request.created = Date.now()

	mongo.insert('VendorRequests', {
		name: request.name,
		url: request.url,
		author: request.author,
		created: request.created
	})

	res.json({
		status: 'SUCCESS'
	})

}