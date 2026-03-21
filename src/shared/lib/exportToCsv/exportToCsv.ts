export function exportToCsv<T>(filename: string, rows: T[], headers: { key: keyof T; label: string }[]) {
	if (!rows || !rows.length) {
		return;
	}

	const csvContent = [
		headers.map(h => `"${String(h.label).replace(/"/g, '""')}"`).join(";"),
		...rows.map(row => 
			headers.map(h => {
				const val = row[h.key];
				const strVal = val !== null && val !== undefined ? String(val) : "";
				return `"${strVal.replace(/"/g, '""')}"`;
			}).join(";")
		)
	].join("\n");

	// Add BOM for Excel UTF-8 support
	const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
	const link = document.createElement("a");
	const url = URL.createObjectURL(blob);
	
	link.setAttribute("href", url);
	link.setAttribute("download", `${filename}.csv`);
	link.style.visibility = "hidden";
	
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}
