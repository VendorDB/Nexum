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

const bcrypt = require('bcrypt')

const PASS = 'VerySecurePassword12345'

let currentRounds = 1

async function test() {
	let startTime = Date.now()
	await bcrypt.hash(PASS, currentRounds)
	let endTime = Date.now()
	return endTime - startTime
}

async function run() {
	while (await test() < 500) {
		currentRounds += 1
	}
	console.log(`Recommended rounds: ${currentRounds}`)
}

console.log('Testing...')
run()