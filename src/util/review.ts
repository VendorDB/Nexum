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

import { ObjectId } from 'mongodb'
import mongo from './mongo'

export const purgeReviews = async (filter: any) => {

	const reviews = <Review[]> await mongo.query('Reviews', filter)

	const vendorList: any = {}

	for(const review of reviews) {
		if(review.isHeld) continue
		if(!vendorList[review.vendor]){
			vendorList[review.vendor] = {
				amount: 1,
				stars: review.stars
			}
		} else {
			vendorList[review.vendor].stars += review.stars
			vendorList[review.vendor].amount += 1
		}
	}

	for(const vendorId in vendorList) {
		const vendor = <Vendor> await mongo.queryOne('Vendors', {_id: new ObjectId(vendorId)})
		const data = vendorList[vendorId]
		vendor.stars -= data.stars
		vendor.reviewAmount -= data.amount
		vendor.averageRating = vendor.stars / vendor.reviewAmount
		mongo.update('Vendors', {_id: new ObjectId(vendorId)}, {
			stars: vendor.stars,
			reviewAmount: vendor.reviewAmount,
			averageRating: vendor.averageRating
		})
	}

	mongo.removeAll('Reviews', filter)
}