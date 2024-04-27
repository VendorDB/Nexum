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

import mongo from '@util/mongo'

const run = async () => {
	const users = await mongo.query('Users', {})

	users?.forEach((user: any) => {
		if(!user.created) {
			mongo.update('Users', {_id: user._id}, {created: Date.now()})
		}
	})
}

export default run