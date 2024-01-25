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

export const post: Handler = async (req, res) => {

	const id = req.body.id

	const review = <Review>await mongo.queryOne('Reviews', { _id: new ObjectId(id) })
	const author = <User>await mongo.queryOne('Users', { _id: new ObjectId(review.author._id) })
	const vendor = <Vendor>await mongo.queryOne('Vendors', { _id: new ObjectId(review.vendor) })

	await mongo.update('Vendors', {_id: vendor._id}, {
		reviewAmount: vendor.reviewAmount - 1,
		stars: vendor.stars - review.stars,
		averageRating: (vendor.stars - review.stars) / (vendor.reviewAmount - 1)
	})

	await mongo.remove('Reviews', { _id: new ObjectId(id) })

	mongo.update('Users', { _id: new ObjectId(review.author._id) }, {
		reputation: author.reputation - 1
	})

	res.json({
		status: 'SUCCESS'
	})

}