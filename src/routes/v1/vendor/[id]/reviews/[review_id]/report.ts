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
import { ObjectId } from 'mongodb'

export const get: Handler = async (req, res) => {

	const user = req.user

	if (!user) {
		res.status(401).json({
			status: 'ERROR',
			error: 'UNAUTHORIZED',
			message: 'Please log in first'
		})
		return
	}

	const review = <Review> await mongo.queryOne('Reviews', { _id: req.params.review_id })

	if (!review) {
		res.status(404).json({
			status: 'ERROR',
			error: 'NOT_FOUND',
			message: 'There is no review with the provided ID'
		})
		return
	}

	if(review.author._id == user._id) {
		res.status(403).json({
			status: 'ERROR',
			error: 'SELF_REPORT',
			message: 'You can\'t report your own review'
		})
		return
	}

	mongo.update('Reviews', { _id: new ObjectId(req.params.review_id) }, {reported: true})
		.then(() => {
			res.json({
				status: 'SUCCESS'
			})
		})

}